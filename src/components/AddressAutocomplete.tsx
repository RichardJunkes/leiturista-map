import { Autocomplete, TextField, CircularProgress } from '@mui/material';

interface AddressSuggestion {
  display_name: string;
  lat: number;
  lon: number;
  importance: number;
}

interface AddressAutocompleteProps {
  label: string;
  placeholder: string;
  options: AddressSuggestion[];
  loading: boolean;
  value: string;
  onInputChange: (newValue: string) => void;
  onOptionSelect: (option: AddressSuggestion | null) => void;
}

const AddressAutocomplete = ({
  label,
  placeholder,
  options,
  loading,
  value,
  onInputChange,
  onOptionSelect,
}: AddressAutocompleteProps) => (
  <>
    <label>{label}</label>
    <Autocomplete
      freeSolo
      options={options}
      getOptionLabel={(option) =>
        typeof option === 'string' ? option : option.display_name
      }
      loading={loading}
      inputValue={value}
      onInputChange={(_, newValue) => onInputChange(newValue)}
      onChange={(_, newValue) => onOptionSelect(newValue as AddressSuggestion)}
      renderInput={(params) => (
        <TextField
          {...params}
          fullWidth
          size="small"
          placeholder={placeholder}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  </>
);

export default AddressAutocomplete;
