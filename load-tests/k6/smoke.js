import http from "k6/http";
import { check, sleep } from "k6";

const env = globalThis.__ENV || {};

const BASE_URL = env.BASE_URL || "http://localhost:5000/api/v1";
const EMAIL = env.LT_EMAIL || "loadtest.user.1@loadtest.local";
const PASSWORD = env.LT_PASSWORD || "LoadTest@123";

export const options = {
  vus: 5,
  duration: "30s",
  thresholds: {
    http_req_duration: ["p(95)<500"],
    http_req_failed: ["rate<0.01"],
  },
};

function login() {
  const res = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ email: EMAIL, password: PASSWORD }),
    {
      headers: { "Content-Type": "application/json" },
      tags: { name: "auth_login" },
    },
  );

  check(res, {
    "login: status 200": (r) => r.status === 200,
    "login: token returned": (r) => !!r.json("data.accessToken"),
  });

  return res.json("data.accessToken");
}

export default function () {
  const token = login();
  if (!token) {
    sleep(1);
    return;
  }

  const toursRes = http.get(`${BASE_URL}/tour?limit=5&page=1`, {
    tags: { name: "get_tours" },
  });

  check(toursRes, {
    "tours: status 200": (r) => r.status === 200,
    "tours: has data": (r) => (r.json("data.tours") || []).length > 0,
  });

  const tours = toursRes.json("data.tours") || [];
  const firstTour = tours[0];

  if (firstTour && firstTour._id) {
    const bookingDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const bookingRes = http.post(
      `${BASE_URL}/booking`,
      JSON.stringify({
        tour: firstTour._id,
        guestCount: 1,
        bookingDate,
        contactInfo: {
          name: "Load Test User",
          phone: "8801000000000",
          email: EMAIL,
        },
      }),
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        tags: { name: "create_booking" },
      },
    );

    check(bookingRes, {
      "booking: success or expected reject": (r) => [201, 400, 401, 403, 404, 429].includes(r.status),
    });
  }

  sleep(1);
}
