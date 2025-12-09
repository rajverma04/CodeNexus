import Editor from "@monaco-editor/react";
import React, { useRef } from "react";

function ProblemPage() {
  const editorRef = useRef(null); // useRef do not allow to render automatically but it store value

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
  }

  function showValue() {
    alert(editorRef.current.getValue());
  }
  return (
    <>
      <button onClick={showValue}>Show value</button>
      <Editor
        height="90vh"
        defaultLanguage="javascript"
        defaultValue="// some comment"
        onMount={handleEditorDidMount}
      />
    </>
  );
}

export default ProblemPage;
