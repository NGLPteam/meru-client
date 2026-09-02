import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type MouseEvent,
} from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { navigate } from "astro:transitions/client";
import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import SearchBar from "@/components/composed/search/SearchBar";
import SearchModalContent from "./SearchModalContent";
import styles from "./SearchModal.module.css";

// Native <dialog> search modal. Replaces the reakit BaseModal here: reakit 1.3.11
// is incompatible with React 19 and its Dialog/Portal opens only once before the
// trigger goes dead. showModal() gives focus-trap + Escape + backdrop for free.
// Parent (SearchButton) opens it via the imperative handle.

export interface SearchModalHandle {
  open: () => void;
}

function getSearchRouteByType(entity?: { type: string; slug: string }) {
  switch (entity?.type) {
    case "Community":
      return `/communities/${entity.slug}/search`;

    case "Collection":
      return `/collections/${entity.slug}/search`;

    default:
      return "/search";
  }
}

const SearchModal = forwardRef<SearchModalHandle, Props>(function SearchModal(
  { data },
  ref,
) {
  const searchId = "searchInput";
  const { t } = useTranslation();
  const searchData = useFragment(fragment, data);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const { register, handleSubmit } = useForm();

  useImperativeHandle(
    ref,
    () => ({ open: () => dialogRef.current?.showModal() }),
    [],
  );

  const onSubmit = (formData: Record<string, string>) => {
    const entity = formData.entity ? JSON.parse(formData.entity) : null;
    const pathname = getSearchRouteByType(entity);

    if (!pathname) {
      console.warn("No search route found.");
      return;
    }
    const params = new URLSearchParams({ q: formData.q });

    navigate(`${pathname}?${params.toString()}`);
    dialogRef.current?.close();
  };

  // Native modal dialogs don't close on backdrop click; a click whose target is
  // the <dialog> element itself (not its content) is a backdrop click.
  const onDialogClick = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) dialogRef.current?.close();
  };

  return (
    // Backdrop click closes; Escape handles keyboard dismissal natively via showModal().
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-label={t("search.label")}
      onClick={onDialogClick}
    >
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <SearchBar id={searchId} {...register("q")} />
        {searchData && (
          <SearchModalContent searchData={searchData} register={register} />
        )}
      </form>
    </dialog>
  );
});

export default SearchModal;

interface Props {
  data?: FragmentType<typeof fragment> | null;
}

export const fragment = graphql(`
  fragment SearchModalFragment on Entity {
    __typename
    ... on Sluggable {
      slug
    }
    ... on Entity {
      title
    }
    breadcrumbs {
      crumb {
        __typename
        ... on Sluggable {
          slug
        }
        ... on Entity {
          title
        }
      }
    }
  }
`);
