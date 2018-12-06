const chai = require("chai");
const chaiHttp = require("chai-http");

const {app, runServer, closeServer} = require("../server");

const expect = chai.expect;

chai.use(chaiHttp);

describe("Recipes", function() {
    before(function() {
        return runServer();
    });

    after(function() {
        return closeServer();
    });

    //  test strategy for GET request
    //  1.  make request to '/recipes'
    //  2.  inspect res object for correct status and json format
    //  3.  further inspect that the res.body is array, at least 1 item, 
    //      expected keys and they are within an object.
    it("GET request should return an array of recipes", function() {
        return chai
          .request(app)
          .get("/recipes")
          .then(function(res) {
              expect(res).to.have.status(200);
              expect(res).to.be.json;
              expect(res.body).to.be.a("array");
              expect(res.body.length).to.be.at.least(1);

              const expectedKeys=["name", "ingredients"];
              res.body.forEach(function(item) {
                  expect(item).to.be.a("object");
                  expect(item).to.include.keys(expectedKeys);
              });
          });

    });

    //  test strategy for POST request
    //  1.  make a POST request that includes data for a new item.
    //  2.  inspect res object for status and json format.
    //  3.  further, inspect res.body for object type, inclusion of all keys, that the id
    //      is not = null and that the body is deep equal to the new item.
    it("POST should add an item to database", function () {
        const newItem = {name: "chix pot pie", ingredients: ["crust", "chix", "broth"]};
        return chai
          .request(app)
          .post("/recipes")
          .send(newItem)
          .then(function(res) {
              expect(res).to.have.status(201);
              expect(res).to.be.json;
              expect(res.body).to.be.a("object");
              expect(res.body).to.include.keys("name", "ingredients");
              expect(res.body.id).to.not.equal(null);
              expect(res.body).to.deep.equal(
                  Object.assign(newItem, {id:res.body.id})
              );
          });
    });

    //  test strategy for PUT request:
    //  1.  initialize some update data(we need to obtain the `id`)
    //  2.  make a GET request so we can get a complete item to update
    //  3.  add the `id` to `updateData`
    //  4.  make the PUT request using the `updateData`
    //  5.  inspect res object for status and json format.
    //  6.  further, inspect object body to make sure it is an object and that 
    //      it is deep equal to updateData

    it("PUT should make a change to an existing record in the database", function() {
        const updateData = {
            name:  "pollo pot pie",
            ingredients: ["refrigerated crust", "rotiserrie chix", "chix broth"]
        };

        return chai
          .request(app)
          .get("/recipes")
          .then(function(res) {
              updateData.id = res.body[0].id;
              return chai
                .request(app)
                .put(`/recipes/${updateData.id}`)
                .send(updateData);
          })
          .then(function(res) {
              expect(res).to.have.status(204);
          });
    });

    //  test strategy for DELETE request:
    //  1.  make a GET request to recipes in order to find the ID of the one to delete.
    //  2.  make the DELETE request and make sure that we return a status 204.
    if("DELETE should delete an existing recipe in the database", function() {
        return (
            chai
              .request(app)
              .get("/recipes")
              .then(function(res) {
                  return chai.request(app).delete(`/recipes/${res.body[0].id}`);
              })
              .then(function(res) {
                  expect(res).to.have.status(204);
              })
        );
    });

});