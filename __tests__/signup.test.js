// const request = require("supertest");
// const app = require("../../src/app");
const { loginController } = require("../src/controllers/authController");

// eslint-disable-next-line no-undef
describe("signupController test", () => {
  // eslint-disable-next-line no-undef
  test("should return status(200), should return token and object(user) with two keys(email,subscription with value string)", async (done) => {
    const mReq = {
      body: {
        email: "example@ex.com",
        password: "123",
      },
    };

    const token = "1";
    const user = {
      email: "userLogin@ex.com",
      subscription: "starter",
    };

    // eslint-disable-next-line no-undef
    const loginMock = await jest.fn();
    const mRes = {};

    loginController(mReq, mRes);

    // eslint-disable-next-line no-undef
    expect(loginMock.mockReturnValueOnce(token, user));
    
  });
});
