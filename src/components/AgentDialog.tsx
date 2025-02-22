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
  inputRef: React.RefObject<HTMLInputElement>;
}> = (props) => {
  const { open, onClose } = props;
  const context = React.useContext(AppContext);
  const [agent, setAgent] = React.useState(context.agent);
  const [yourmodelUrl, setYourmodelUrl] = React.useState(context.yourmodelUrl);

  const handleClose = (shouldFocusInput = false) => {
    onClose();
    setYourmodelUrl(context.yourmodelUrl);

    setTimeout(() => {
      window.scroll({
        top: document.body.offsetHeight,
      });
      if (shouldFocusInput) {
        props.inputRef.current?.focus();
        setTimeout(() => {
          window.scroll({
            top: document.body.offsetHeight,
          });
        }, 200);
      }
    }, 250);
  }

  const handleSaveYourModel = async () => {
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
        onClose={() => handleClose()}
        TransitionComponent={Transition}
        fullWidth
      >
        <InputLabel variant="standard" htmlFor="uncontrolled-native">
          Agent
        </InputLabel>
        <Select
          style={{ paddingTop: "10px", paddingBottom: "10px" }}
          defaultValue={"gpt4"}
          value={agent}
          onChange={(event) => {
            const changedAgent = event.target.value as Agent;
            setAgent(changedAgent);
            if (changedAgent !== "yourmodel") {
              context.setAgent(changedAgent);
              handleClose(true);
            }
          }}
        >
          <MenuItem value={"none"}>None</MenuItem>
          <MenuItem value={"o1-mini"}>OpenAI (o1-mini) (Slow but more accurate)</MenuItem>
          <MenuItem value={"gpt4"}>OpenAI (gpt-4o)</MenuItem>
          <MenuItem value={"gemini2.0"}>Google Gemini</MenuItem>
          <MenuItem value={"yourmodel"}>Your LLM</MenuItem>
          <MenuItem value={"python"}>Python (Runtime)</MenuItem>
        </Select>
        {agent === "yourmodel" && <TextField id="standard-basic"
          label="Your LLM OpenAI-compatible API URL"
          variant="standard"
          placeholder="Example: https://detected-move-folders-legends.trycloudflare.com"
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
        {agent === "yourmodel" && <div className={linkClasses.link}><a target="_blank" href="https://github.com/oobabooga/text-generation-webui/wiki/12-%E2%80%90-OpenAI-API/47806cac93e0365a39f8ce5cb53b0dd699d26b4a">How to generate one?</a></div>}
        {agent === "yourmodel" && <Button variant="text" onClick={handleSaveYourModel}>Save</Button>}
      </Dialog>
    </div>
  );
}
export default AgentDialog;