import { Tour } from "./tour.model";
import { GuideProfile } from "../guide/guideProfile/guideProfile.model";

const DHAKA_TIMEZONE = "Asia/Dhaka";

type TourPhase = "upcoming" | "running" | "ended" | "unknown";

interface TourLifecycleState {
  phase: TourPhase;
  status: "active" | "inactive";
  isAvailable: boolean;
}

const formatDateKeyInDhaka = (date: Date) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: DHAKA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

export const resolveTourLifecycleState = (
  startDate?: Date,
  endDate?: Date,
  now: Date = new Date(),
): TourLifecycleState => {
  if (!startDate || !endDate) {
    return {
      phase: "unknown",
      status: "active",
      isAvailable: true,
    };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return {
      phase: "unknown",
      status: "active",
      isAvailable: true,
    };
  }

  const todayKey = formatDateKeyInDhaka(now);
  const startKey = formatDateKeyInDhaka(start);
  const endKey = formatDateKeyInDhaka(end);

  if (todayKey < startKey) {
    return {
      phase: "upcoming",
      status: "active",
      isAvailable: true,
    };
  }

  if (todayKey > endKey) {
    return {
      phase: "ended",
      status: "inactive",
      isAvailable: false,
    };
  }

  return {
    phase: "running",
    status: "active",
    isAvailable: false,
  };
};

export const syncTourLifecycleStates = async () => {
  const tours = await Tour.find({
    startDate: { $exists: true, $ne: null },
    endDate: { $exists: true, $ne: null },
  })
    .select("_id startDate endDate status isAvailable guide")
    .lean();

  const guidesBeingReleased: string[] = [];

  const bulkOps = tours
    .map((tour) => {
      const lifecycle = resolveTourLifecycleState(tour.startDate, tour.endDate);

      if (
        tour.status === lifecycle.status &&
        tour.isAvailable === lifecycle.isAvailable
      ) {
        return null;
      }

      // Collect guides from tours that are transitioning to ended
      if (lifecycle.phase === "ended" && tour.guide) {
        guidesBeingReleased.push(String(tour.guide));
      }

      return {
        updateOne: {
          filter: { _id: tour._id },
          update: {
            $set: {
              status: lifecycle.status,
              isAvailable: lifecycle.isAvailable,
            },
          },
        },
      };
    })
    .filter((op): op is NonNullable<typeof op> => op !== null);

  if (bulkOps.length) {
    await Tour.bulkWrite(bulkOps);
  }

  // Release guide locks for tours that have ended
  if (guidesBeingReleased.length) {
    await GuideProfile.updateMany(
      { user: { $in: guidesBeingReleased }, ongoingTourId: { $ne: null } },
      { $set: { ongoingTourId: null, isAvailable: true } },
    );
  }

  return {
    scanned: tours.length,
    updated: bulkOps.length,
  };
};

export const TourLifecycle = {
  DHAKA_TIMEZONE,
  resolveTourLifecycleState,
  syncTourLifecycleStates,
};
