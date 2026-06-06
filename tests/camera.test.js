import supertest from "supertest";
import app from "../server.js";

const request = supertest(app);

describe("GET /cameras API", () => {


  test("should return 200 OK", async () => {
    const res = await request.get("/cameras");

    expect(res.statusCode).toBe(200);
  });


  test("should return JSON array", async () => {
    const res = await request.get("/cameras");

    expect(Array.isArray(res.body)).toBe(true);
  });


  test("each camera should contain quadrant and imageUrl", async () => {
    const res = await request.get("/cameras");

    if (res.body.length > 0) {
      const camera = res.body[0];

      expect(camera).toHaveProperty("quadrant");
      expect(camera).toHaveProperty("imageUrl");
    }
  });


  test("imageUrl should be a string", async () => {
    const res = await request.get("/cameras");

    if (res.body.length > 0) {
      const camera = res.body[0];

      expect(typeof camera.imageUrl).toBe("string");
    }
  });

});
