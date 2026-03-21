describe("Login", () => {
  beforeEach(() => {
    cy.visit("/login");
  });

  it("should display login form", () => {
    cy.contains("Olá, de novo!").should("be.visible");
    cy.get('input[type="email"]').should("be.visible");
    cy.get('input[type="password"]').should("be.visible");
    cy.contains("Continuar").should("be.visible");
  });

  it("should show validation errors when submitting empty fields", () => {
    cy.contains("Continuar").click();

    cy.get("form").should("contain.text", "E-mail");
    cy.get("form").should("contain.text", "Senha");
  });

  it("should toggle password visibility", () => {
    cy.get('input[placeholder="Insira a sua senha"]').should(
      "have.attr",
      "type",
      "password",
    );

    cy.get('[data-testid="toggle-password-visibility"]').click();

    cy.get('input[placeholder="Insira a sua senha"]').should(
      "have.attr",
      "type",
      "text",
    );

    cy.get('[data-testid="toggle-password"]').click();

    cy.get('input[placeholder="Insira a sua senha"]').should(
      "have.attr",
      "type",
      "password",
    );
  });

  it("should login successfully", () => {
    cy.intercept("POST", "/auth/login", {
      statusCode: 200,
      body: {
        token: "fake-token",
      },
    }).as("loginRequest");

    cy.get('input[type="email"]').type("teste@email.com");
    cy.get('input[type="password"]').type("123456");

    cy.contains("Continuar").click();

    cy.wait("@loginRequest");

    cy.url().should("eq", `${Cypress.config().baseUrl}/`);
  });

  it("should show API error when login fails", () => {
    cy.intercept("POST", "/auth/login", {
      statusCode: 401,
      body: {},
    }).as("loginRequest");

    cy.get('input[type="email"]').type("teste@email.com");
    cy.get('input[type="password"]').type("senhaerrada");

    cy.contains("Continuar").click();

    cy.wait("@loginRequest");

    cy.contains("E-mail ou senha inválidos.").should("be.visible");
  });
});
