import useSWR from 'swr';
import Dropdown from "./Dropdown";
import InputField from './InputField';
import * as api from '../util/api';
import { useState, useRef } from 'react';
import ErrorMesage from './ErrorMessage';

const formatNumber = (n) => {
  const str = n.toString();
  return str.length < 2 ? `0${str}` : str;
};

const defaultResolvers = {
  ['$now']: () => {
    const now = new Date();
    return `${formatNumber(now.getDate())}.${formatNumber(now.getMonth() + 1)}.${now.getFullYear()}`;
  },
};

const DocumentEditor = ({ defaultData = {} }) => {
  const isMounted = useRef(true);
  const { data, error, revalidate, isValidating } = useSWR(`${api.TEMPLATE_API}/templates`, api.fetch, { shouldRetryOnError: false });
  const [template, setTemplate] = useState(null);
  const [templateData, setTemplateData] = useState(defaultData);
  const [templateError, setTemplateError] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <div>
      {
        (error && !isValidating)
          ? <ErrorMesage error={error} onClose={() => revalidate()} />
          : (
              !data 
              ? <progress className="progress is-medium is-primary" max="100" />
              : <Dropdown 
                  data={data.templates.map(t => ({ key: t.document, name: t.name }))} 
                  defaultText="Оберіть шаблон..." 
                  active={template ? template.document : null}
                  onChange={(v) => {
                    const t = data.templates.find(t => t.document === v.key);

                    if (t) {
                      setTemplate(t);

                      const defaultValues = {};

                      for (let v of t.template) {
                        if (v.default) {
                          const value = defaultResolvers[v.default] ? defaultResolvers[v.default]() : v.default;
                          defaultValues[v.token] = value;
                        }
                      }

                      setTemplateData({ ...templateData, ...defaultValues });
                    }
                  }}
                  style={{ marginBottom: '3em' }}
                />
          )
      }
      {
        template &&
        <div className="box">
          <p className="subtitle" style={{ textAlign: 'center' }}>{template.name} ({template.document})</p>
          <hr />
          {
            template.template.map(t => 
              <InputField 
                key={t.token} 
                title={t.name} 
                value={templateData[t.token] || ''} 
                onChange={(text) => { setTemplateData({ ...templateData, [t.token]: text }) }} 
              />
            )
          }
          <div className="field is-grouped">
            <button 
              className={`button is-info is-light ${loading ? 'is-loading' : ''}`}
              disabled={loading}
              onClick={async () => {
                setTemplateError(null);
                setLoading(true);

                try {
                  const { data } = await api.post(`${api.TEMPLATE_API}/documents/download`, {
                    template: template.document,
                    data: templateData,
                  }, {}, false);

                  window.open(`${api.TEMPLATE_API}/documents/download?id=${data.id}`, '_blank');

                  if (isMounted) {
                    setLoading(false);
                  }
                } catch (err) {
                  if (isMounted) {
                    setTemplateError(err);
                    setLoading(false);
                  }
                }
              }}
            >
              <span className="icon">
                <i className="fas fa-file-download"></i>
              </span>
              <span>Завантажити документ</span>
            </button>
            <button 
              className={`button is-info is-fullwidth ${loading ? 'is-loading' : ''}`}
              disabled={loading}
              onClick={async () => {
                setTemplateError(null);

                try {
                  await api.post(`${api.TEMPLATE_API}/documents`, {
                    template: template.document,
                    data: templateData,
                  }, {}, false);

                  alert('Документ надіслан.');

                  if (isMounted) {
                    setTemplateData({});
                    setLoading(false);
                  }
                } catch (err) {
                  if (isMounted) {
                    setTemplateError(err);
                    setLoading(false);
                  }
                }
              }}
            >
              <span className="icon">
                <i className="fas fa-paper-plane"></i>
              </span>
              <span>Надіслати документ</span>
            </button>
          </div>
          {
            templateError &&
            <ErrorMesage error={templateError} onClose={() => setTemplateError(null)} />
          }
        </div>
      }
    </div>
  )
};

export default DocumentEditor;