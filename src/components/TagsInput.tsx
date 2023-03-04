import * as React from 'react';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { makeStyles } from "@material-ui/core/styles";
import { useEffect, useContext } from 'react';
import { AppContext } from '../store/AppContext';
import { TagModel } from '../models/TagModel';

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
  setValue: (value: TagModel[]) => void;
}> = (props) => {
  const classes = useStyles();
  const context = useContext(AppContext);

  return (
    <Autocomplete
      multiple
      id="fixed-tags-demo"
      value={props.value}
      className={classes.textField}
      onChange={(event, newValue) => {
        props.setValue(newValue);
        // setValue([
        //   ...newValue.filter((option) => tags.indexOf(option) === -1),
        // ]);
      }}
      options={context.tags}
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
        <TextField {...params} helperText="Enter your tags" />
      )}
    />
  );
}

export default TagsInput;
