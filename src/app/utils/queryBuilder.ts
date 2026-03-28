import { Query } from "mongoose";
import { excludeField } from "../constant";

export class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public readonly query: Record<string, string>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, string>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  filter(): this {
    const filter: Record<string, unknown> = { ...this.query };
    for (const field of excludeField) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete filter[field];
    }

    const minPrice = Number(this.query.minPrice);
    const maxPrice = Number(this.query.maxPrice);

    if (!Number.isNaN(minPrice) || !Number.isNaN(maxPrice)) {
      const startingPriceRange: Record<string, number> = {};

      if (!Number.isNaN(minPrice)) {
        startingPriceRange.$gte = minPrice;
      }

      if (!Number.isNaN(maxPrice)) {
        startingPriceRange.$lte = maxPrice;
      }

      filter.startingPrice = startingPriceRange;
    }

    const multiValueFields = ["division", "district", "tourType"] as const;

    multiValueFields.forEach((field) => {
      const rawValue = filter[field];

      if (typeof rawValue !== "string" || !rawValue.includes(",")) {
        return;
      }

      filter[field] = {
        $in: rawValue
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
      };
    });

    this.modelQuery = this.modelQuery.find(filter);
    return this;
  }

  search(searchableField: string[]): this {
    const searchTerm = this.query.searchTerm || "";

    const searchQuery = {
      $or: searchableField.map((field) => ({
        [field]: { $regex: searchTerm, $options: "i" },
      })),
    };

    this.modelQuery = this.modelQuery.find(searchQuery);

    return this;
  }

  fields(): this {
    const selectedFields = this.query.fields?.split(",").join(" ") || "";
    this.modelQuery = this.modelQuery.select(selectedFields);
    return this;
  }

  sort(): this {
    const sorting = this.query.sort || "-createdAt";
    this.modelQuery = this.modelQuery.sort(sorting);
    return this;
  }

  paginate(): this {
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;
    const skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.limit(limit).skip(skip);

    return this;
  }

  async getMeta() {
    const totalQuery = this.modelQuery.getFilter();
    const totalDocuments =
      await this.modelQuery.model.countDocuments(totalQuery);
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;
    const totalPage = Math.ceil(totalDocuments / limit);

    return {
      page,
      limit,
      total: totalDocuments,
      totalPage,
    };
  }

  build() {
    return this.modelQuery;
  }
}
