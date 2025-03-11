import {
    Banner,
    useApi,
    useTranslate,
    reactExtension,
    List,
    ListItem,
    Image,
    Grid,
    View,
    BlockStack,
    TextBlock,
    Text,
    Button,
    InlineStack,
    Heading,
    InlineLayout,
    BlockLayout,
    HeadingGroup,
    useApplyCartLinesChange,
    useApplyAttributeChange,
    useCartLines,
    useSettings,
  } from "@shopify/ui-extensions-react/checkout";
  import { useEffect, useState } from "react";
  
  export default reactExtension("purchase.checkout.block.render", () => (
    <Extension />
  ));
  
  function Extension() {
    const translate = useTranslate();
    const { extension, query, i18n } = useApi();
    const [product, setProduct] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingStates, setLoadingStates] = useState({});
    const applyCartLinesChange = useApplyCartLinesChange();
    const applyAttributeChange = useApplyAttributeChange();
    const lines = useCartLines();
  
    const { title, subtitle } = useSettings();
  
    const updateKeyById = (idToUpdate) => {
      setProduct((prevData) =>
        prevData.map((item) => {
          if (item.id === idToUpdate) {
            return {
              ...item,
              status: true,
            };
          }
          return item;
        })
      );
    };
  
    const handleAddToCart = async (selectedQty, selectedVar) => {
      var payload = {
        type: "addCartLine",
        merchandiseId: selectedVar,
        quantity: selectedQty,
      };
  
      payload.attributes = [
        {
          key: "_Checkout_Switcher_Upsell",
          value: "Upsell",
        },
      ];
  
      await applyCartLinesChange(payload);
  
      await applyAttributeChange({
        key: "checkoutSwitcherUpsell",
        type: "updateAttribute",
        value: "upgrade",
      });
  
      updateKeyById(selectedVar);
  
      setLoadingStates((prevStates) => ({
        ...prevStates,
        [selectedVar]: false,
      }));
    };
  
    const getProducts = () => {
      query(
        `query ($first: Int! , $tag: String!) {
          products(first: $first query: $tag) {
            nodes {
              id
              title
              tags
              requiresSellingPlan
              featuredImage {
                url
              }
              images(first:1){
                nodes {
                  url
                }
              }
              variants(first: 1) {
                nodes {
                  id
                  price{
                    amount
                    currencyCode
                  }
                  selectedOptions {
                    name
                    value
                  }
                }
              }
            }
          }
        }`,
        {
          variables: { first: 3, tag: "tag:checkout-upsell" },
        }
      )
        .then(({ data }) => {
          let tmpData = [];
          data.products.nodes.forEach((element) => {
            const hasMerchandise = lines.some(
              (item) => item.merchandise.id === element.variants.nodes[0].id
            );
  
            console.log(element.variants.nodes[0].id);
            if (!hasMerchandise) {
              tmpData.push({
                id: element.variants.nodes[0].id,
                title: element.title,
                price:i18n.formatCurrency(element.variants.nodes[0].price.amount),
                img: element.featuredImage.url+"&height=100&width=100",
                status: hasMerchandise,
              });
            }
          });
          setProduct(tmpData);
          console.log(tmpData);
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => setLoading(false));
    };
  
    const addtocart = (id) => {
      console.log(id);
      setLoadingStates((prevStates) => ({
        ...prevStates,
        [id]: true,
      }));
      handleAddToCart(1, id);
    };
  
    useEffect(() => {
      getProducts();
    }, []);
  
    const productData = [
      {
        id: 1,
        title: "Product 1",
        price: "$20",
        img: "https://thails-plus-sandbox.myshopify.com/cdn/shop/files/23073273_medium-bottle-01.jpg",
      },
      {
        id: 1,
        title: "Product 2",
        price: "$20",
        img: "https://thails-plus-sandbox.myshopify.com/cdn/shop/files/23073273_medium-bottle-01.jpg",
      },
      {
        id: 1,
        title: "Product 3",
        price: "$20",
        img: "https://thails-plus-sandbox.myshopify.com/cdn/shop/files/23073273_medium-bottle-01.jpg",
      },
    ];
  
    return (
      <>
        {product && product.length > 1 ? (
          <Grid
            columns={["50%", "50%", product.length > 2 ? "50%" : "fill"]}
            rows={["auto"]}
            spacing="loose"
          >
            {product.map((item, index) => {
              if (item.status) {
                return null;
              }
              return (
                <BlockLayout
                  key={index}
                  rows="auto"
                  border={["none", "none", "none", "none"]}
                  padding={["base", "none", "none", "none"]}
                  inlineAlignment="center"
                  blockAlignment="baseline"
                  minInlineSize="fill"
                >
                  <View border="none" padding="none">
                    <Image source={item.img} />
                  </View>
                  <View border="none" padding="none">
                    <TextBlock inlineAlignment="center">
                      <Text size="small" emphasis="bold">
                        {item.title}
                      </Text>
                    </TextBlock>
                  </View>
                  <View border="none" padding="none">
                    <Text size="small">{item.price}</Text>
                  </View>
                  <View border="none" padding="none">
                    <InlineLayout columns={[300]} rows={"auto"}>
                      <Button
                        loading={loadingStates[item.id] || false}
                        disabled={item.status}
                        kind="primary"
                        appearance="monochrome"
                        onPress={() => addtocart(item.id)}
                      >
                        {item.status ? "Added" : "Add"}
                      </Button>
                    </InlineLayout>
                  </View>
                </BlockLayout>
              );
            })}
          </Grid>
        ) : (
          <BlockLayout
            rows="auto"
            border={["none", "none", "none", "none"]}
            padding={["base", "none", "none", "none"]}
          >
            <Heading inlineAlignment="center">{title ? title : ""}</Heading>
        <TextBlock inlineAlignment="center">
          <Text size="small" inlineAlignment="">
            {subtitle ? subtitle : ""}
          </Text>
        </TextBlock>
            <List marker="none">
              {product &&
                product.map((item, index) => {
                  if (item.status) {
                    return null;
                  }
                  return (
                    <ListItem key={index}>
                      <Grid
                        columns={["20%", "fill", "auto"]}
                        padding={["base", "none", "none", "none"]}
                        inlineAlignment="start"
                        blockAlignment="center"
                      >
                        <View
                          border="none"
                          padding={["none", "base", "none", "none"]}
                        >
                          <Image
                            source={item.img}
                            fit="cover"
                            cornerRadius="large"
                            borderWidth="base"
                            border="base"
                          />
                        </View>
                        <View border="none" padding="none">
                          <BlockStack>
                            <TextBlock
                              emphasis="bold"
                              size="medium"
                              inlineAlignment="center"
                            >
                              {item.title}
                            </TextBlock>
                            <TextBlock  size="small">
                              {item.price}
                            </TextBlock>
                          </BlockStack>
                        </View>
                        <View border="none" padding="none">
                          <Button
                            loading={loadingStates[item.id] || false}
                            disabled={item.status}
                            kind="primary"
                            appearance="monochrome"
                            onPress={() => addtocart(item.id)}
                          >
                            {item.status ? "Added" : "Add"}
                          </Button>
                        </View>
                      </Grid>
                    </ListItem>
                  );
                })}
            </List>
          </BlockLayout>
        )}
      </>
    );
  }