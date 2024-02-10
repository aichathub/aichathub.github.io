import LandingPage from "./LandingPage";

const ExplorePage = () => {
  return <LandingPage />;
  // const context = useContext(AppContext);
  // const [posts, setPosts] = useState<PostModel[]>([]);
  // const handleDrawerOpen = () => {
  //   context.setTopLeftBarOpen(true);
  // };
  // const handleDrawerClose = () => {
  //   context.setTopLeftBarOpen(false);
  // };

  // useEffect(() => {
  //   context.setIsLoadingMessages(true);
  //   getRecommendations(context.loggedUser).then((result) => {
  //     context.setIsLoadingMessages(false);
  //     if (result.message !== "SUCCESS") {
  //       return;
  //     }
  //     setPosts(result.result);
  //     context.setIsInitializing(false);
  //   });
  // }, [context.loggedUser, context.lastPostsRefresh]);

  // let bodyContent = <>
  //   <Grid container>
  //     {
  //       posts.map((post, index) => {
  //         return <SearchItem key={index} post={post} typeEffect={true} />
  //       })
  //     }
  //   </Grid>
  // </>;

  // if (context.isLoadingMessages) {
  //   bodyContent = <Grid container>
  //     {
  //       [1, 2, 3, 4, 5, 6, 7].map((x) => {
  //         return <SearchItem key={Math.random()} post={DummyPostModel} typeEffect={false} isLoading={true} />
  //       })
  //     }
  //   </Grid>
  // }

  // const result = (
  //   <>
  //     {bodyContent}
  //     <Box
  //       sx={{
  //         flexGrow: 1,
  //         justifyContent: "center",
  //         display: "flex",
  //         mb: 2,
  //       }}
  //     ></Box>
  //   </>
  // );

  // if (!context.loggedUser) {
  //   return <LandingPage />;
  // }

  // return result;
};
export default ExplorePage;
