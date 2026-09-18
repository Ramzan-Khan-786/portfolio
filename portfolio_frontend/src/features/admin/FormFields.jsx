import './Forms.css';
export default function FormFields({ fields, values, errors = {}, projects = [], onChange }) {
  return (
    <div className="grid min-w-0 gap-4 sm:grid-cols-2">
      {fields.map(({ name, label, type = 'text', help, options, ...validation }) => {
        const error = errors[name]?.join(' ');
        const common = {
          id: 'field-' + name,
          name,
          'aria-invalid': Boolean(error),
          'aria-describedby': error ? name + '-error' : help ? name + '-help' : undefined,
        };
        if (type === 'checkbox')
          return (
            <label key={name} className="cms-checkbox">
              <input
                {...common}
                type="checkbox"
                checked={Boolean(values[name])}
                onChange={(event) => onChange(name, event.target.checked)}
              />
              <span>
                {label}
                {error && (
                  <small className="cms-field-error" id={name + '-error'}>
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
          onChange: (event) => onChange(name, event.target.value),
        };
        return (
          <div
            key={name}
            className={'cms-field ' + (['textarea', 'lines'].includes(type) ? 'sm:col-span-2' : '')}
          >
            <label htmlFor={common.id}>
              {label}
              {validation.required && <span aria-hidden="true"> *</span>}
            </label>
            {type === 'textarea' || type === 'lines' ? (
              <textarea {...input} rows={name === 'body' || name === 'description' ? 6 : 3} />
            ) : type === 'select' || type === 'project' ? (
              <select {...input}>
                {type === 'project' ? (
                  <>
                    <option value="">No associated project</option>
                    {projects.map((project) => (
                      <option key={project._id} value={project._id}>
                        {project.title}
                        {project.published ? '' : ' (draft)'}
                      </option>
                    ))}
                  </>
                ) : (
                  options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))
                )}
              </select>
            ) : (
              <input {...input} type={['array', 'project'].includes(type) ? 'text' : type} />
            )}
            {help && <small id={name + '-help'}>{help}</small>}
            {error && (
              <small className="cms-field-error" id={name + '-error'}>
                {error}
              </small>
            )}
          </div>
        );
      })}
    </div>
  );
}
