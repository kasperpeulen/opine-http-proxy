import { describe, it } from "./support/utils.ts";
import { proxyTarget } from "./support/proxyTarget.ts";
import { superdeno, opine, json, urlencoded, expect } from "./deps.ts";
import { Request, Response, NextFunction } from "../deps.ts";
import { proxy } from "../mod.ts";

describe("when making a proxy request with a payload", () => {
  const testCases = [
    { name: "form encoded", encoding: "application/x-www-form-urlencoded" },
    { name: "JSON encoded", encoding: "application/json" },
  ];

  testCases.forEach((test) => {
    it(`should deliver non-empty querystring params when ${test.name} (GET)`, (
      done,
    ) => {
      const target = opine();
      target.use(json());
      target.use(urlencoded());

      target.get("/", (req, res) => {
        expect(req.query.name).toEqual("Deno");
        expect(req.headers.get("content-type")).toEqual(test.encoding);
        res.json({ message: "Hello Deno!" });
      });

      const proxyServer = target.listen();
      const proxyPort = (proxyServer.listener.addr as Deno.NetAddr).port;

      const app = opine();
      app.use("/proxy", proxy(`http://127.0.0.1:${proxyPort}`));

      superdeno(app)
        .get("/proxy")
        .query({ name: "Deno" })
        .set("Content-Type", test.encoding)
        .end((err, res) => {
          proxyServer.close();
          expect(res.body.message).toEqual("Hello Deno!");
          done(err);
        });
    });

    it(`should deliver an empty body when ${test.name} (POST)`, (done) => {
      const target = opine();
      target.use(json());
      target.use(urlencoded());

      target.post("/", (req, res) => {
        expect(req.parsedBody).toEqual({});
        expect(req.headers.get("content-type")).toEqual(test.encoding);
        res.json({ message: "Hello Deno!" });
      });

      const proxyServer = target.listen();
      const proxyPort = (proxyServer.listener.addr as Deno.NetAddr).port;

      const app = opine();
      app.use("/proxy", proxy(`http://127.0.0.1:${proxyPort}`));

      superdeno(app)
        .post("/proxy")
        .send(test.encoding.includes("json") ? {} : "")
        .set("Content-Type", test.encoding)
        .end((err, res) => {
          proxyServer.close();
          expect(res.body.message).toEqual("Hello Deno!");
          done(err);
        });
    });

    it(`should deliver a non-empty body when ${test.name} (POST)`, (done) => {
      const target = opine();
      target.use(json());
      target.use(urlencoded());

      target.post("/", (req, res) => {
        expect(req.parsedBody.name).toEqual("Deno");
        expect(req.headers.get("content-type")).toEqual(test.encoding);
        res.json({ message: "Hello Deno!" });
      });

      const proxyServer = target.listen();
      const proxyPort = (proxyServer.listener.addr as Deno.NetAddr).port;

      const app = opine();
      app.use("/proxy", proxy(`http://127.0.0.1:${proxyPort}`));

      superdeno(app)
        .post("/proxy")
        .send(test.encoding.includes("json") ? { name: "Deno" } : "name=Deno")
        .set("Content-Type", test.encoding)
        .end((err, res) => {
          proxyServer.close();
          expect(res.body.message).toEqual("Hello Deno!");
          done(err);
        });
    });

    it(`should not deliver a non-empty body when "parseReqBody" is for when ${test.name} (POST)`, (
      done,
    ) => {
      const target = opine();
      target.use(json());
      target.use(urlencoded());

      target.post("/", (req, res) => {
        expect(req.parsedBody).toEqual({});
        expect(req.headers.get("content-type")).toEqual(test.encoding);
        res.json({ message: "Hello Deno!" });
      });

      const proxyServer = target.listen();
      const proxyPort = (proxyServer.listener.addr as Deno.NetAddr).port;

      const app = opine();
      app.use(
        "/proxy",
        proxy(`http://127.0.0.1:${proxyPort}`, { parseReqBody: false }),
      );

      superdeno(app)
        .post("/proxy")
        .send(test.encoding.includes("json") ? { name: "Deno" } : "name=Deno")
        .set("Content-Type", test.encoding)
        .end((err, res) => {
          proxyServer.close();
          expect(res.body.message).toEqual("Hello Deno!");
          done(err);
        });
    });
  });

  // it("should support parseReqBody", function (done) {
  //   var nockedPostWithBody = nock("http://127.0.0.1:12345")
  //     .get("/", "")
  //     .matchHeader("Content-Type", "application/json")
  //     .reply(200, {
  //       name: "get with parseReqBody false",
  //     });

  //   localServer.use(
  //     "/proxy",
  //     proxy("http://127.0.0.1:12345", {
  //       parseReqBody: false,
  //     }),
  //   );
  //   localServer.use(function (req, res) {
  //     res.sendStatus(200);
  //   });
  //   localServer.use(function (err, req, res, next) {
  //     throw new Error(err, req, res, next);
  //   });

  //   request(localServer)
  //     .get("/proxy")
  //     .send({
  //       name: "Deno",
  //     })
  //     .set("Content-Type", "application/json")
  //     .expect(function (res) {
  //       assert(res.body.name === "get with parseReqBody false");
  //       nockedPostWithBody.done();
  //     })
  //     .end(done);
  // });
});
