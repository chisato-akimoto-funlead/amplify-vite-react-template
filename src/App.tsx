import { Heading, Loader, ThemeProvider } from "@aws-amplify/ui-react";
import { FaceLivenessDetector } from "@aws-amplify/ui-react-liveness";
import { get } from "aws-amplify/api";
import React from "react";
import toast from "react-hot-toast";
import { Link } from "react-router";

function App() {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [success, setSuccess] = React.useState('');
  const [confidence, setConfidence] = React.useState(0);
  const [createLivenessApiData, setCreateLivenessApiData] = React.useState<{
    sessionId: string;
  } | null>(null);

  React.useEffect(() => {
    const fetchCreateLiveness: () => Promise<void> = async () => {
      /*
       * This should be replaced with a real call to your own backend API
       */
      await new Promise((r) => setTimeout(r, 2000));
      const { body } = await get({
        apiName: "myRestApi",
        path: "/items",
      }).response;
      const val = JSON.parse(await body.text());
      const data = { sessionId: val.sessionId };
      console.log(data);
      setCreateLivenessApiData(data);
      setLoading(false);
    };

    fetchCreateLiveness();
  }, []);

  const handleAnalysisComplete: () => Promise<void> = async () => {
    /*
     * This should be replaced with a real call to your own backend API
     */
    if (!createLivenessApiData) {
      console.error("createLivenessApiData is null");
      return;
    }
    const { body } = await get({
      apiName: "myRestApi",
      path: "/getitems",
      options: {
        queryParams: {
          sessionId: createLivenessApiData.sessionId,
        },        
      }
    }).response;

    const val = JSON.parse(await body.text());

    /*
     * Note: The isLive flag is not returned from the GetFaceLivenessSession API
     * This should be returned from your backend based on the score that you
     * get in response. Based on the return value of your API you can determine what to render next.
     * Any next steps from an authorization perspective should happen in your backend and you should not rely
     * on this value for any auth related decisions.
     */
    console.log(val);
    setConfidence(val.confidence);
    if (val.isLive) {
      toast.success("User is live");
      setSuccess("認証成功");
    } else {
      toast.error("User is not live");
      setSuccess("認証失敗");
    }
  };

  return (
    <ThemeProvider>
      {loading ? (
        <Loader />
      ) : createLivenessApiData ? (
        <>
          <FaceLivenessDetector
            sessionId={createLivenessApiData.sessionId}
            region="ap-northeast-1"
            onAnalysisComplete={handleAnalysisComplete}
            onError={(error) => {
              console.error(error);
            }}
          />
          <Heading level={2}>{confidence}%</Heading>
          <Heading level={2}>{success}</Heading>
          <Link to="/app">顔認証</Link>
        </>
      ) : (
        <div>Error: Session data is null</div>
      )}
    </ThemeProvider>
  );
}

export default App;
