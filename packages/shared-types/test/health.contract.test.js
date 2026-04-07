import test from "node:test";
import assert from "node:assert/strict";

test("health response shape contract example", () => {
  const sample = {
    status: "ok",
    service: "moviehub-api",
    timestamp: new Date().toISOString(),
  };

  assert.equal(sample.status, "ok");
  assert.equal(sample.service, "moviehub-api");
  assert.equal(typeof sample.timestamp, "string");
});
