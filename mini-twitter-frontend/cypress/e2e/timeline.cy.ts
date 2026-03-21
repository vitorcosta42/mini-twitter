describe("Timeline (com login real)", () => {
  beforeEach(() => {
    cy.intercept("POST", "**/auth/login", {
      statusCode: 200,
      body: {
        token: "fake-jwt-token",
        user: { id: 1, name: "vitor" },
      },
    }).as("loginRequest");

    cy.visit("/login");

    cy.get('input[placeholder="Insira o seu e-mail"]').type("vitor@email.com");
    cy.get('input[placeholder="Insira a sua senha"]').type("123456");

    cy.get('button[type="submit"]').click();

    cy.wait("@loginRequest");

    cy.intercept("GET", "**/posts**", {
      statusCode: 200,
      body: {
        page: 1,
        limit: 10,
        total: 1,
        posts: [
          {
            id: 1,
            title: "Post teste",
            content: "Conteúdo teste",
            authorId: 1,
            authorName: "vitor",
            image: "",
            createdAt: "2026-01-01",
            likesCount: 0,
          },
        ],
      },
    }).as("getPosts");

    cy.visit("/");
    cy.wait("@getPosts");
  });

  it("should display posts", () => {
    cy.contains("Post teste").should("be.visible");
    cy.contains("Conteúdo teste").should("be.visible");
  });

  it("should like a post", () => {
    cy.intercept("POST", "**/like", { statusCode: 200 }).as("likePost");
    cy.get('[data-testid="heart-icon"]').click();
    cy.wait("@likePost");
  });

  it("should open and close post menu", () => {
    cy.get('button[aria-label="menu"]').should("be.visible").click();
    cy.contains("Editar").should("be.visible");
    cy.contains("Deletar").should("be.visible");

    cy.get('button[aria-label="menu"]').click();
    cy.contains("Editar").should("not.exist");
  });

  it("should delete a post", () => {
    cy.intercept("DELETE", "**/posts/**", { statusCode: 200 }).as("deletePost");
    cy.get('button[aria-label="menu"]').click();
    cy.contains("Deletar").click();
    cy.wait("@deletePost");
  });

  it("should enter edit mode", () => {
    cy.get('button[aria-label="menu"]').click();
    cy.contains("Editar").click();
    cy.get('input[placeholder="Título"]').should("be.visible");
    cy.get("textarea").should("be.visible");
  });

  it("should update a post", () => {
    cy.intercept("PUT", "**/posts/**", { statusCode: 200 }).as("updatePost");
    cy.contains("Post teste").parent().as("postContainer");

    cy.get("@postContainer").within(() => {
      cy.get('button[aria-label="menu"]').click();
    });

    cy.get("@postContainer").within(() => {
      cy.contains("Editar").click();
    });

    cy.get('input[placeholder="Título"]').last().clear().type("Novo título");
    cy.get("textarea").last().clear().type("Novo conteúdo");
    cy.contains("Salvar").click();
    cy.wait("@updatePost");
  });

  it("should cancel edit mode", () => {
    cy.get('button[aria-label="menu"]').click();

    cy.contains("Editar").click();
    cy.contains("Cancelar").should("be.visible").click();

    cy.get("Cancelar").should("not.exist");
  });

  it("should show empty state", () => {
    cy.intercept("GET", "**/posts**", {
      statusCode: 200,
      body: { page: 1, limit: 10, total: 0, posts: [] },
    }).as("emptyPosts");

    cy.visit("/");
    cy.wait("@emptyPosts");
    cy.contains("Nenhum post encontrado.").should("be.visible");
  });

  it("should search posts", () => {
    cy.intercept("GET", "**/posts**", {
      statusCode: 200,
      body: {
        page: 1,
        limit: 10,
        total: 1,
        posts: [
          {
            id: 2,
            title: "Busca",
            content: "Resultado busca",
            authorId: 1,
            authorName: "vitor",
            image: "",
            createdAt: "2026-01-01",
            likesCount: 0,
          },
        ],
      },
    }).as("searchPosts");

    cy.get('input[placeholder="Buscar por post..."]').type("busca");
    cy.wait("@searchPosts");
    cy.contains("Busca").should("be.visible");
  });
});
