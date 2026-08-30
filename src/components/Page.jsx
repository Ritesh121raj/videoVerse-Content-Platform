function Page({ title, message }) {
  return (
    <main className="main-content">

      <h1>{title}</h1>

      <p className="page-message">
        {message}
      </p>

    </main>
  );
}

export default Page;