import {
  useApi,
  useTranslate,
  reactExtension,
  BlockStack,
  InlineStack,
  Image,
  View,
  Text,
  useSettings,
} from "@shopify/ui-extensions-react/checkout";

export default reactExtension("purchase.checkout.block.render", () => (
  <Extension />
));

function Extension() {
  const translate = useTranslate();
  const { extension } = useApi();

  const { review_star, review_name, review_content } = useSettings();

  const showStars = (stars) => {
    if(stars == "none"){
      return "";
    }
    var html = [];

    if (stars) {
      for (let i = 0; i < stars; i++) {
        html.push(
          <View maxInlineSize={20} key={i}>
            <Image source="https://cdn.shopify.com/s/files/1/0814/4548/6910/files/star.png?v=1694174704" />
          </View>
        );
      }
    }

    return html;
  };

  return (
    <BlockStack
      border="base"
      
      cornerRadius="base"
      accessibilityRole="section"
      padding={["base", "base", "base", "base"]}
    >
      <InlineStack spacing="none">
        {review_star ? showStars(review_star) : showStars(5)}
      </InlineStack>
      <Text size="base">
        {review_content
          ? review_content
          : ""}
      </Text>
      <Text size="medium" emphasis="bold">
        {review_name ? review_name : ""}
      </Text>
    </BlockStack>
  );
}
