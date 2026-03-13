import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';

/**
 * Tiptap extensions for the blog editor.
 * Note: Placeholder extension is excluded from generateHTML calls
 * as it doesn't render properly in HTML output.
 */
export const TIPTAP_EXTENSIONS = [
  StarterKit,
  Image,
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      rel: 'noopener noreferrer',
      target: '_blank'
    }
  })
];
