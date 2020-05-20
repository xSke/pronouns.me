import { GetStaticPaths, GetStaticProps } from "next";
import FrontPage from "../components/FrontPage";
import { allPronouns, toTemplate } from "../pronouns";

export default FrontPage;

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: allPronouns.map((ps) => {
      return {
        params: {
          pronouns: toTemplate(ps, { shorten: true }).split("/"),
        },
      };
    }),
    fallback: true,
  };
};
