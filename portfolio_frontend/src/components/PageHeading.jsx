export default function PageHeading({ title, children }) {
  return (
    <header className="page-heading">
      <div>
        <h1>{title}</h1>
      </div>
      {children && <p>{children}</p>}
    </header>
  );
}
