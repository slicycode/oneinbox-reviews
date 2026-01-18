import { helloWorld } from "./hello-world";
import { expireCredits } from "./expire-credits";
import { reviewsSyncCron } from "./reviews-sync";
import { reviewBackfillCron } from "./review-backfill";
import { accountDeletionCron } from "./account-deletion";

export type InngestEvents = {
  // TIP: Add your events here, where key is the event name and value is the event data format
  "test/hello.world": {
    data: {
      email: string;
    };
  };
};

// TIP: Add your functions here, failing this will result in function not being registered
export const functions = [
  helloWorld,
  expireCredits,
  reviewsSyncCron,
  reviewBackfillCron,
  accountDeletionCron,
];
