<!-- src/components/news/RichTextEditor.vue -->
<script setup>
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { watch } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Write your story...' },
})
const emit = defineEmits(['update:modelValue'])

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Underline,
    Link.configure({ openOnClick: false }),
    Placeholder.configure({ placeholder: props.placeholder }),
  ],
  onUpdate({ editor }) {
    emit('update:modelValue', editor.getHTML())
  },
  editorProps: {
    attributes: {
      class: 'rte-content form-control',
    },
  },
})

// Keep editor in sync when parent clears form
watch(
  () => props.modelValue,
  (val) => {
    if (editor.value && editor.value.getHTML() !== val) {
      editor.value.commands.setContent(val || '', false)
    }
  },
)

function setLink() {
  const prev = editor.value?.getAttributes('link').href || ''
  const url = window.prompt('Enter URL:', prev)
  if (url === null) return
  if (url === '') {
    editor.value?.chain().focus().unsetLink().run()
  } else {
    editor.value?.chain().focus().setLink({ href: url }).run()
  }
}
</script>

<template>
  <div class="rte-wrapper rounded-3 border overflow-hidden">
    <!-- Toolbar -->
    <div v-if="editor" class="rte-toolbar d-flex flex-wrap gap-1 p-2 border-bottom bg-white">
      <button
        v-for="({ action, icon, label, isActive }) in [
          { action: () => editor.chain().focus().toggleBold().run(),        icon: 'format_bold',          label: 'Bold',         isActive: editor.isActive('bold') },
          { action: () => editor.chain().focus().toggleItalic().run(),      icon: 'format_italic',        label: 'Italic',       isActive: editor.isActive('italic') },
          { action: () => editor.chain().focus().toggleUnderline().run(),   icon: 'format_underlined',    label: 'Underline',    isActive: editor.isActive('underline') },
          { action: () => editor.chain().focus().toggleBulletList().run(),  icon: 'format_list_bulleted', label: 'Bullet List',  isActive: editor.isActive('bulletList') },
          { action: () => editor.chain().focus().toggleOrderedList().run(), icon: 'format_list_numbered', label: 'Ordered List', isActive: editor.isActive('orderedList') },
          { action: () => editor.chain().focus().toggleBlockquote().run(),  icon: 'format_quote',         label: 'Blockquote',   isActive: editor.isActive('blockquote') },
        ]"
        :key="icon"
        type="button"
        class="btn btn-sm p-1 rounded-2 d-flex align-items-center justify-content-center"
        :class="isActive ? 'btn-primary text-white' : 'btn-light text-muted'"
        :title="label"
        @click="action"
        style="width:32px;height:32px"
      >
        <span class="material-symbols-outlined" style="font-size:1rem">{{ icon }}</span>
      </button>

      <!-- Link button -->
      <button
        type="button"
        class="btn btn-sm p-1 rounded-2 d-flex align-items-center justify-content-center"
        :class="editor.isActive('link') ? 'btn-primary text-white' : 'btn-light text-muted'"
        title="Insert Link"
        style="width:32px;height:32px"
        @click="setLink"
      >
        <span class="material-symbols-outlined" style="font-size:1rem">link</span>
      </button>

      <div class="vr mx-1"></div>

      <!-- Undo / Redo -->
      <button
        type="button"
        class="btn btn-sm btn-light text-muted p-1 rounded-2 d-flex align-items-center justify-content-center"
        title="Undo"
        style="width:32px;height:32px"
        @click="editor.chain().focus().undo().run()"
        :disabled="!editor.can().undo()"
      >
        <span class="material-symbols-outlined" style="font-size:1rem">undo</span>
      </button>
      <button
        type="button"
        class="btn btn-sm btn-light text-muted p-1 rounded-2 d-flex align-items-center justify-content-center"
        title="Redo"
        style="width:32px;height:32px"
        @click="editor.chain().focus().redo().run()"
        :disabled="!editor.can().redo()"
      >
        <span class="material-symbols-outlined" style="font-size:1rem">redo</span>
      </button>
    </div>

    <!-- TipTap editor content area -->
    <EditorContent :editor="editor" />
  </div>
</template>

<style scoped>
.rte-wrapper {
  background: white;
}
.rte-toolbar {
  background: #f8f9fa;
}
/* TipTap editor area */
:deep(.rte-content) {
  min-height: 140px;
  max-height: 320px;
  overflow-y: auto;
  border: none !important;
  border-radius: 0 !important;
  outline: none !important;
  box-shadow: none !important;
  padding: 0.75rem 1rem;
  font-family: 'Roboto Condensed', sans-serif;
  font-size: 0.95rem;
  line-height: 1.6;
  color: #333;
}
:deep(.rte-content:focus) {
  box-shadow: none !important;
}
:deep(.tiptap p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  color: #adb5bd;
  pointer-events: none;
  float: left;
  height: 0;
}
:deep(.rte-content a) {
  color: #e2065f;
  text-decoration: underline;
}
:deep(.rte-content blockquote) {
  border-left: 3px solid #e2065f;
  padding-left: 1rem;
  color: #6c757d;
  font-style: italic;
}
</style>
