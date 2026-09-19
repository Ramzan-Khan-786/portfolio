export default function PageHeading({ number, title, children }) {
  return (
    <header className="page-heading">
      <div>
        <p className="eyebrow">{number} / Portfolio</p>
        <h1>{title}</h1>
      </div>
      {children && <p>{children}</p>}
    </header>
  );
}
