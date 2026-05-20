import { getEnvironmentConfig } from "../environment";

describe("Environment Configuration", () => {
  it("always uses mock data mode", () => {
    const config = getEnvironmentConfig();

    expect(config.env).toBe("dev");
    expect(config).not.toHaveProperty("databaseUrl");
  });
});
