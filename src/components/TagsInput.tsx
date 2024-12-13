import { makeStyles } from "@material-ui/core/styles";
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import * as React from 'react';
import { useContext, useState } from 'react';
import { TagModel } from '../models/TagModel';
import { AppContext } from '../store/AppContext';

const useStyles = makeStyles(theme => ({
  textField: {
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(5),
    marginRight: theme.spacing(1),
    width: 300,
  }
}));

const TagsInput: React.FC<{
  value: TagModel[];
  options: TagModel[];
  setValue: (value: TagModel[]) => void;
  helperText: string;
}> = (props) => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);

  return (
    <Autocomplete
      multiple
      id="fixed-tags-demo"
      value={props.value}
      open={open}
      className={classes.textField}
      onKeyUp={(event) => {
        const val = (event.target as HTMLInputElement).value;
        if (!val || val.length === 0) {
          if (open) setOpen(false);
        } else {
          if (!open) setOpen(true);
        }
      }}
      onChange={(event, newValue) => {
        const val = (event.target as HTMLInputElement).value;
        if (!val || val.length === 0) {
          if (open) setOpen(false);
        } else {
          if (!open) setOpen(true);
        }
        props.setValue([...newValue]);
      }}
      options={props.options}
      getOptionLabel={(option) => option.tag}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => (
          <Chip
            label={option.tag}
          />
        ))
      }
      style={{ width: 500 }}
      renderInput={(params) => (
        <TextField {...params} helperText={props.helperText} />
      )}
    />
  );
}

export default TagsInput;
