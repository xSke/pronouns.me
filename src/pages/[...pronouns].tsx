import { GetStaticPaths, GetStaticProps } from "next";
import FrontPage from "../components/FrontPage";
import { allPronouns } from "../pronouns";

export default FrontPage;

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: allPronouns
      .filter((ps) => ps.toUrl()) // Filter invalids
      .map((ps) => {
        return {
          params: {
            pronouns: ps.toUrl()?.split("/"),
          },
        };
      }),
    fallback: true,
  };
};
