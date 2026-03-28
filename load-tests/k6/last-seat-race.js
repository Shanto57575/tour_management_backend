import http from "k6/http";
import { check } from "k6";
import exec from "k6/execution";

const env = globalThis.__ENV || {};

const BASE_URL = env.BASE_URL || "http://localhost:5000/api/v1";
const PASSWORD = env.LT_PASSWORD || "LoadTest@123";
const USERS = Number(env.RACE_USERS || "25");
const HOT_TOUR_QUERY = encodeURIComponent(env.HOT_TOUR_TITLE || "LoadTest Hot Race Tour");

export const options = {
  scenarios: {
    last_seat_race: {
      executor: "shared-iterations",
      vus: USERS,
      iterations: USERS,
      maxDuration: "2m",
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<1200"],
    http_req_failed: ["rate<0.2"],
  },
};

function login(email) {
  const res = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ email, password: PASSWORD }),
    {
      headers: { "Content-Type": "application/json" },
      tags: { name: "race_login" },
    },
  );

  if (res.status !== 200) {
    return null;
  }

  return res.json("data.accessToken");
}

function getHotTourId() {
  const res = http.get(`${BASE_URL}/tour?searchTerm=${HOT_TOUR_QUERY}&limit=20&page=1`, {
    tags: { name: "race_get_hot_tour" },
  });

  if (res.status !== 200) {
    return null;
  }

  const tours = res.json("data.tours") || [];
  const hotTour = tours.find((t) => t.title === decodeURIComponent(HOT_TOUR_QUERY));
  return hotTour ? hotTour._id : null;
}

export default function () {
  const vuId = exec.vu.idInTest;
  const email = `loadtest.user.${vuId}@loadtest.local`;

  const token = login(email);
  check(token, {
    "token acquired": (t) => !!t,
  });

  if (!token) {
    return;
  }

  const hotTourId = getHotTourId();
  check(hotTourId, {
    "hot tour found": (id) => !!id,
  });

  if (!hotTourId) {
    return;
  }

  const bookingDate = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString();
  const res = http.post(
    `${BASE_URL}/booking`,
    JSON.stringify({
      tour: hotTourId,
      guestCount: 1,
      bookingDate,
      contactInfo: {
        name: `Race User ${vuId}`,
        phone: `8801${String(100000000 + vuId).slice(-9)}`,
        email,
      },
      specialRequests: "LOADTEST: last-seat-race",
    }),
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      tags: { name: "race_create_booking" },
    },
  );

  check(res, {
    "booking result is controlled": (r) => [201, 400, 403, 404, 409, 429].includes(r.status),
  });
}
