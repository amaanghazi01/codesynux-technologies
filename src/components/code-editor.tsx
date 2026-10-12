import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { javascript } from "@codemirror/lang-javascript";

const langs = { html: html(), css: css(), js: javascript({ jsx: true }) };

export default function CodeEditor({ value, onChange, lang }: { value: string; onChange: (v: string) => void; lang: keyof typeof langs }) {
  return <CodeMirror value={value} onChange={onChange} extensions={[langs[lang]]} height="100%" className="h-full text-sm" basicSetup={{ lineNumbers: true, foldGutter: true, autocompletion: true, bracketMatching: true, closeBrackets: true, highlightActiveLine: true }} />;
}
