import { useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../store/AppContext";
import { findUrlByShortUrl } from "../util/db";

const ShortLinkPage = () => {
  const context = useContext(AppContext);
  const { shortid } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    if (shortid) {
      const url = window.location.origin + "/s/" + shortid;
      findUrlByShortUrl(url).then((response) => {
        if (response.message !== "SUCCESS") {
          navigate("/");
          context.showSnack("GET SHORT URL: " + response.message);
        } else {
          navigate(response.result.replace(window.location.origin, ""));
        }
      });
    }
  }, [])
  return (
    <div>
      <h1>Redirecting...</h1>
    </div>
  );
}

export default ShortLinkPage;