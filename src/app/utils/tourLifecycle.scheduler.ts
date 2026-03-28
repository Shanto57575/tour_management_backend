import cron from "node-cron";
import { TourLifecycle } from "../modules/tour/tour.lifecycle";

let isSyncRunning = false;

const runTourLifecycleSync = async (source: "startup" | "cron") => {
  if (isSyncRunning) {
    return;
  }

  try {
    isSyncRunning = true;
    const result = await TourLifecycle.syncTourLifecycleStates();

    if (result.updated > 0) {
      console.log(
        `[tour-lifecycle:${source}] scanned=${result.scanned} updated=${result.updated}`,
      );
    }
  } catch (error) {
    console.error("[tour-lifecycle] failed to sync tour lifecycle states", error);
  } finally {
    isSyncRunning = false;
  }
};

export const startTourLifecycleScheduler = () => {
  void runTourLifecycleSync("startup");

  cron.schedule(
    "*/10 * * * *",
    () => {
      void runTourLifecycleSync("cron");
    },
    {
      timezone: TourLifecycle.DHAKA_TIMEZONE,
    },
  );

  console.log(
    `[tour-lifecycle] scheduler started (timezone=${TourLifecycle.DHAKA_TIMEZONE}, cron=*/10 * * * *)`,
  );
};
