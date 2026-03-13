import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';

/**
 * Tiptap extensions for the blog editor.
 * StarterKit's built-in link (if any) is disabled to avoid
 * "Duplicate extension names found: ['link']" warning.
 */
export const TIPTAP_EXTENSIONS = [
  StarterKit.configure({
    // @ts-ignore — disable link if StarterKit bundles one
    link: false,
  }),
  Image,
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      rel: 'noopener noreferrer',
      target: '_blank',
    },
  }),
];
