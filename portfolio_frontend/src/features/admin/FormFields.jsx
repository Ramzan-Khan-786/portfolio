import { useId } from 'react';
import './Forms.css';
import MediaField, { MediaGallery } from '../media/MediaField.jsx';
export default function FormFields({ fields, values, errors = {}, projects = [], onChange }) {
  const prefix = useId();
  return (
    <div className="grid min-w-0 gap-4 sm:grid-cols-2">
      {fields.map(
        ({
          name,
          label,
          type = 'text',
          help,
          options,
          fields: children,
          max = 30,
          category = 'misc',
          ...validation
        }) => {
          const error = errors[name]?.join(' '),
            id = prefix + '-' + name;
          const common = {
            id,
            name,
            'aria-invalid': Boolean(error),
            'aria-describedby': error ? id + '-error' : help ? id + '-help' : undefined,
          };
          if (type === 'media' || type === 'gallery') {
            const Component = type === 'gallery' ? MediaGallery : MediaField;
            return <div className="sm:col-span-2 min-w-0" key={name}><Component label={label} category={category} projectSlug={values.slug || undefined} max={max} value={values[name] || (type === 'gallery' ? [] : null)} onChange={(value) => onChange(name, value)} />{error && <p className="cms-field-error" role="alert">{error}</p>}</div>;
          }
          if (type === 'repeater') {
            const rows = values[name] || [];
            function move(index, delta) {
              const copy = [...rows];
              [copy[index], copy[index + delta]] = [copy[index + delta], copy[index]];
              onChange(name, copy);
            }
            return (
              <fieldset className="cms-repeater sm:col-span-2" key={name}>
                <legend>{label}</legend>
                {help && <p className="text-xs text-muted mb-3">{help}</p>}
                {rows.map((row, index) => (
                  <div className="cms-repeater-row" key={index}>
                    <div className="flex justify-between items-center gap-2 mb-3">
                      <strong className="text-xs">
                        {label} {index + 1}
                      </strong>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          className="cms-icon"
                          aria-label={'Move ' + label + ' ' + (index + 1) + ' up'}
                          disabled={index === 0}
                          onClick={() => move(index, -1)}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="cms-icon"
                          aria-label={'Move ' + label + ' ' + (index + 1) + ' down'}
                          disabled={index === rows.length - 1}
                          onClick={() => move(index, 1)}
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          className="cms-icon"
                          aria-label={'Remove ' + label + ' ' + (index + 1)}
                          onClick={() =>
                            onChange(
                              name,
                              rows.filter((_, i) => i !== index),
                            )
                          }
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <FormFields
                      fields={children}
                      values={row}
                      onChange={(key, value) =>
                        onChange(
                          name,
                          rows.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
                        )
                      }
                    />
                  </div>
                ))}
                {rows.length < max && (
                  <button
                    type="button"
                    className="admin-secondary"
                    onClick={() =>
                      onChange(name, [
                        ...rows,
                        Object.fromEntries(children.map((f) => [f.name, ''])),
                      ])
                    }
                  >
                    Add {label.toLowerCase()} entry
                  </button>
                )}
                {error && (
                  <p className="cms-field-error" role="alert">
                    {error}
                  </p>
                )}
              </fieldset>
            );
          }
          if (type === 'choices')
            return (
              <fieldset className="sm:col-span-2" key={name}>
                <legend className="text-sm font-medium mb-3">{label}</legend>
                <div className="flex flex-wrap gap-4">
                  {options.map((option) => (
                    <label className="cms-checkbox" key={option}>
                      <input
                        type="checkbox"
                        checked={(values[name] || []).includes(option)}
                        onChange={(e) =>
                          onChange(
                            name,
                            e.target.checked
                              ? [...(values[name] || []), option]
                              : (values[name] || []).filter((v) => v !== option),
                          )
                        }
                      />
                      {option}
                    </label>
                  ))}
                </div>
                {help && <p className="text-xs text-muted mt-2">{help}</p>}
                {error && <p className="cms-field-error">{error}</p>}
              </fieldset>
            );
          if (type === 'checkbox')
            return (
              <label key={name} className="cms-checkbox">
                <input
                  {...common}
                  type="checkbox"
                  checked={Boolean(values[name])}
                  onChange={(e) => onChange(name, e.target.checked)}
                />
                <span>
                  {label}
                  {error && (
                    <small className="cms-field-error" id={id + '-error'}>
                      {error}
                    </small>
                  )}
                </span>
              </label>
            );
          const input = {
            ...common,
            ...validation,
            value: values[name] ?? '',
            onChange: (e) => onChange(name, e.target.value),
          };
          return (
            <div
              key={name}
              className={
                'cms-field ' + (['textarea', 'lines'].includes(type) ? 'sm:col-span-2' : '')
              }
            >
              <label htmlFor={id}>
                {label}
                {validation.required && <span aria-hidden="true"> *</span>}
              </label>
              {['textarea', 'lines'].includes(type) ? (
                <textarea {...input} rows={['body', 'description'].includes(name) ? 6 : 3} />
              ) : ['select', 'project'].includes(type) ? (
                <select {...input}>
                  {type === 'project' ? (
                    <>
                      <option value="">No associated project</option>
                      {projects.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.title}
                          {p.published ? '' : ' (draft)'}
                        </option>
                      ))}
                    </>
                  ) : (
                    options.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))
                  )}
                </select>
              ) : (
                <input {...input} type={type === 'array' ? 'text' : type} />
              )}{' '}
              {(help || type === 'lines') && (
                <small id={id + '-help'}>{help || 'One entry per line.'}</small>
              )}
              {error && (
                <small className="cms-field-error" id={id + '-error'}>
                  {error}
                </small>
              )}
            </div>
          );
        },
      )}
    </div>
  );
}
