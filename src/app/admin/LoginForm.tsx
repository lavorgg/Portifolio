"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

export function LoginForm() {
  const [error, action, pending] = useActionState(loginAction, null);
  return (
    <main className="login">
      <form action={action} className="login-box">
        <h1>Painel do portfólio</h1>
        <p>Entre com a senha para editar projetos, cursos e contato.</p>
        <label htmlFor="password">Senha</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required autoFocus />
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button className="a-btn primary" disabled={pending}>
          {pending ? "Entrando…" : "Entrar"}
        </button>
        <a href="/" className="muted-link">
          Voltar para o site
        </a>
      </form>
    </main>
  );
}
