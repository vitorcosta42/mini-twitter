describe("Register Page", () => {
  beforeEach(() => {
    cy.visit("/login?tab=register");
  });

  it("should display register form", () => {
    cy.contains("Olá, vamos começar!").should("be.visible");
    cy.get('input[placeholder="Insira o seu nome"]').should("be.visible");
    cy.get('input[placeholder="Insira o seu e-mail"]').should("be.visible");
    cy.get('input[placeholder="Insira a sua senha"]').should("be.visible");
  });

  it("should show validation errors", () => {
    cy.get("button[type=submit]").click();

    cy.contains("Nome").should("exist");
    cy.contains("E-mail").should("exist");
    cy.contains("Senha").should("exist");
  });

  it("should toggle password visibility", () => {
    cy.visit("/login?tab=register");

    cy.get('input[placeholder="Insira a sua senha"]')
      .as("passwordInput")
      .should("have.attr", "type", "password");

    cy.get('[data-testid="toggle-password"]').click();

    cy.get("@passwordInput").should("have.attr", "type", "text");
  });

  it("should submit form successfully", () => {
    cy.intercept("POST", "**/auth/register", {
      statusCode: 200,
      body: {},
    }).as("registerRequest");

    cy.get('input[placeholder="Insira o seu nome"]').type("Vitor");
    cy.get('input[placeholder="Insira o seu e-mail"]').type("vitor@email.com");
    cy.get('input[placeholder="Insira a sua senha"]').type("123456");

    cy.get("button[type=submit]").click();

    cy.wait("@registerRequest");

    cy.contains("Olá, de novo!").should("exist");
  });

  it("should show API error", () => {
    cy.intercept("POST", "**/auth/register", {
      statusCode: 500,
    }).as("registerError");

    cy.get('input[placeholder="Insira o seu nome"]').type("Vitor");
    cy.get('input[placeholder="Insira o seu e-mail"]').type("vitor@email.com");
    cy.get('input[placeholder="Insira a sua senha"]').type("123456");

    cy.get("button[type=submit]").click();

    cy.wait("@registerError");

    cy.contains("Não foi possível realizar o cadastro.").should("exist");
  });
});
