import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import { useTranslation } from "react-i18next";
import { useController, useFormContext } from "react-hook-form";
import { Checkbox, CheckboxGroup } from "@/components/forms";

export default function SearchSchemaFilter({ data }: Props) {
  const { control } = useFormContext();

  const schemaData = useFragment<FragmentType<typeof fragment>>(
    fragment,
    data,
  );

  const { t } = useTranslation();

  const { field } = useController({
    control,
    name: "schema",
  });

  // We don't want to render the checkboxes until we have the default value.
  // schemaQuery should always return an array.
  return (
    <CheckboxGroup label={t("filter.type_header")}>
      {schemaData.schemas
        .filter(({ namespace }) => namespace !== "default")
        .map(({ schemaDefinition, name }) => (
          <Checkbox
            key={`${schemaDefinition.slug}`}
            label={name}
            onChange={(e) => {
              let valueCopy = field?.value ? [...field.value] : [];

              const { checked, value } = e.target;

              if (checked && !valueCopy.includes(value)) {
                valueCopy.push(value);
              } else {
                valueCopy = valueCopy.filter((v) => v !== value);
              }

              // send data to react hook form
              field.onChange(valueCopy);
            }}
            checked={field.value?.includes(`${schemaDefinition.slug}`)}
            value={`${schemaDefinition.slug}`}
          />
        ))}
    </CheckboxGroup>
  );
}

interface Props {
  data: FragmentType<typeof fragment>;
}

const fragment = graphql(`
  fragment SearchSchemaFilterFragment on SearchScope {
    schemas: availableSchemaVersions {
      name
      namespace
      schemaDefinition {
        slug
      }
    }
  }
`);
