import { Loader, ThemeProvider } from "@aws-amplify/ui-react";
import { FaceLivenessDetector } from "@aws-amplify/ui-react-liveness";
import { get } from "aws-amplify/api";
import React from "react";

function App() {
  const [loading, setLoading] = React.useState<boolean>(true);
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
      console.log(body.text());
      const data = { sessionId: await body.text() };
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

    const data = await body.json();

    /*
     * Note: The isLive flag is not returned from the GetFaceLivenessSession API
     * This should be returned from your backend based on the score that you
     * get in response. Based on the return value of your API you can determine what to render next.
     * Any next steps from an authorization perspective should happen in your backend and you should not rely
     * on this value for any auth related decisions.
     */
    console.log(data);
    if (data) {
      console.log("User is live");
    } else {
      console.log("User is not live");
    }
  };

  return (
    <ThemeProvider>
      {loading ? (
        <Loader />
      ) : createLivenessApiData ? (
        <FaceLivenessDetector
          sessionId={createLivenessApiData.sessionId}
          region="us-east-1"
          onAnalysisComplete={handleAnalysisComplete}
          onError={(error) => {
            console.error(error);
          }}
        />
      ) : (
        <div>Error: Session data is null</div>
      )}
    </ThemeProvider>
  );
}

export default App;
