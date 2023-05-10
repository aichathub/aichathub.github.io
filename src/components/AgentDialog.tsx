import ClearIcon from '@mui/icons-material/Clear';
import { Button, IconButton, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import * as React from 'react';
import { Agent, AppContext } from '../store/AppContext';
import { getCustomModelName } from '../util/db';
import linkClasses from './Link.module.css';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const AgentDialog: React.FC<{
  open: boolean;
  onClose: () => void;
}> = (props) => {
  const { open, onClose } = props;
  const context = React.useContext(AppContext);
  const [agent, setAgent] = React.useState(context.agent);
  const [yourmodelUrl, setYourmodelUrl] = React.useState(context.yourmodelUrl);

  const handleClose = () => {
    onClose();
    setYourmodelUrl(context.yourmodelUrl);

    setTimeout(() => {
      window.scroll({
        top: document.body.offsetHeight,
      });
    }, 500);
  }

  const handleSave = async () => {
    if (agent === "yourmodel") {
      try {
        const modelName = await getCustomModelName(yourmodelUrl);
        if (!modelName) throw new Error("Failed to get model name");
        context.setYourmodelName(modelName);
        context.setYourmodelUrl(yourmodelUrl);
        context.setAgent(agent as Agent);
        context.setIsYourmodelConnected(true);
        context.showSnack("Connected to " + modelName + "!");
        handleClose();
      } catch (err) {
        context.showSnack("Failed to get model name. Please check your url.");
      }
    } else {
      context.setAgent(agent as Agent);
      handleClose();
    }
  }

  const onUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setYourmodelUrl(event.target.value);
  }

  const handleClearClick = () => {
    setYourmodelUrl("");
  }

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
        fullWidth
      >
        <InputLabel variant="standard" htmlFor="uncontrolled-native">
          Agent
        </InputLabel>
        <Select
          style={{ paddingTop: "10px", paddingBottom: "10px" }}
          defaultValue={"none"}
          value={agent}
          onChange={(event) => {
            setAgent(event.target.value as Agent);
          }}
        >
          <MenuItem value={"none"}>None</MenuItem>
          <MenuItem value={"gpt3.5"}>ChatGPT (gpt-3.5-turbo)</MenuItem>
          <MenuItem value={"gpt4"}>ChatGPT (gpt-4)</MenuItem>
          <MenuItem value={"yourmodel"}>Your Model</MenuItem>
          <MenuItem value={"python"}>Python</MenuItem>
        </Select>
        {agent === "yourmodel" && <TextField id="standard-basic"
          label="Your model api url"
          variant="standard"
          placeholder="https://detected-move-folders-legends.trycloudflare.com/api"
          value={yourmodelUrl}
          onChange={onUrlChange}
          InputProps={{
            endAdornment: (
              <IconButton
                sx={{ visibility: yourmodelUrl ? "visible" : "hidden" }}
                onClick={handleClearClick}
              >
                <ClearIcon />
              </IconButton>
            ),
          }}
        />}
        {agent === "yourmodel" && <div className={linkClasses.link}><a target="_blank" href="https://colab.research.google.com/drive/1teDosN4zxuTuqRq5rIzidgrqf0P9XmKJ?usp=sharing">How to generate one?</a></div>}
        <Button variant="text" onClick={handleSave}>Save</Button>
      </Dialog>
    </div>
  );
}
export default AgentDialog;