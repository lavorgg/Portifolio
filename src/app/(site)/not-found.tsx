import Link from "next/link";

export default function NotFound() {
  return (
    <section className="projects-head projects">
      <h1 className="h1">Página não encontrada</h1>
      <p className="lede">Esse endereço não existe ou o projeto saiu do ar.</p>
      <p>
        <Link href="/" className="btn btn-solid btn-lg">
          Voltar para o início
        </Link>
      </p>
    </section>
  );
}
