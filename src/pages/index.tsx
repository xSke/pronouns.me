import MainPronounsPage from "./[...pronouns]";

export default function Index(): JSX.Element {
  // We're cheating. This isn't from the server at all. mwahahaha.
  return <MainPronounsPage pathFromServer="/they" />;
}
