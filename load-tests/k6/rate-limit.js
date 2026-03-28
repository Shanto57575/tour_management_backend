import http from "k6/http";
import { check } from "k6";

const env = globalThis.__ENV || {};

const BASE_URL = env.BASE_URL || "http://localhost:5000/api/v1";
const EMAIL = env.LT_EMAIL || "loadtest.user.1@loadtest.local";
const PASSWORD = env.LT_PASSWORD || "LoadTest@123";

export const options = {
  scenarios: {
    throttle_probe: {
      executor: "constant-arrival-rate",
      rate: Number(env.RATE || "80"),
      timeUnit: "1s",
      duration: env.DURATION || "30s",
      preAllocatedVUs: 20,
      maxVUs: 120,
    },
  },
};

let token = "";
let hotTourId = "";

function initAuthAndTour() {
  const loginRes = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ email: EMAIL, password: PASSWORD }),
    { headers: { "Content-Type": "application/json" } },
  );

  token = loginRes.json("data.accessToken") || "";

  const toursRes = http.get(`${BASE_URL}/tour?searchTerm=LoadTest%20Hot%20Race%20Tour&limit=10&page=1`);
  const tours = toursRes.json("data.tours") || [];
  const hot = tours.find((t) => t.title === "LoadTest Hot Race Tour");
  hotTourId = hot ? hot._id : "";
}

export default function () {
  if (!token || !hotTourId) {
    initAuthAndTour();
  }

  if (!token || !hotTourId) {
    return;
  }

  const bookingDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
  const res = http.post(
    `${BASE_URL}/booking`,
    JSON.stringify({
      tour: hotTourId,
      guestCount: 1,
      bookingDate,
      contactInfo: {
        name: "RateLimit Probe",
        phone: "8801000000000",
        email: EMAIL,
      },
      specialRequests: "LOADTEST: rate-limit-probe",
    }),
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      tags: { name: "rate_limit_probe" },
    },
  );

  check(res, {
    "request finished": (r) => r.status > 0,
  });
}
