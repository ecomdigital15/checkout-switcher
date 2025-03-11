import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  reactExtension,
  Text,
  Grid,
  Pressable,
  Popover,
  useApi,
  TextBlock,
  InlineLayout,
  Spinner,
  Button,
  Stepper,
  BlockStack,
  Select,
  Icon,
  View,
  InlineStack,
  useCartLines,
  useSettings,
  useApplyCartLinesChange,
  useApplyAttributeChange,
  useAttributes,
} from "@shopify/ui-extensions-react/checkout";

// 1. Choose an extension target
export default reactExtension("purchase.checkout.cart-line-item.render-after", () => (
  <Extension />
));

function Extension() {
  const { query, target } = useApi();
  const cartitems = useCartLines();
  const [loading, setLoading] = useState(false);
  const [showOption, setShowOption] = useState(false);
  const [appSub, setAppSub] = useState(false);
  const [subscription, setSubscription] = useState(false);
  const {
    subscription_text,
    subscription_link_text,
    remove_button,
    quantity_selector,
    modify_button,
  } = useSettings();
  const [showPopup, setShowPopup] = useState(false);
  const action = useRef(false);
  const [handleRemove, setHandleRemove] = useState(true);
  const [adding, setAdding] = useState(false);
  const [subsData, setSubsData] = useState(false);
  const [product, setProduct] = useState(false);
  const [selectedVar, setSelectedVar] = useState("");
  const [selectedSubs, setSelectedSubs] = useState("");
  const [selectedQty, setSelectedQty] = useState(1);
  const applyCartLinesChange = useApplyCartLinesChange();
  const applyAttributeChange = useApplyAttributeChange();
  const attributes = useAttributes();

  //console.log("target",target)  
  const handleAddToCartRemove = useCallback(async () => {
    setAdding(true);
    
    const result = await applyCartLinesChange({
      type: "removeCartLine",
      id: target.current.id,
      quantity: target.current.quantity,
    });
    setAdding(false);
  }, [adding]);

  const handleAddToCart = async (selectedQty, selectedSubs, selectedVar) => {
    setAdding(true);
    setShowPopup(false);
    var payload = {
      type: "updateCartLine",
      id: target.current.id,
      merchandiseId: selectedVar,
      quantity: selectedQty,
      sellingPlanId: selectedSubs,
    };

    if (selectedSubs) {
      payload.attributes = [
        {
          key: "_Checkout_Switcher_Upgrade",
          value: "Subscription",
        },
      ];
    } else {
      payload.attributes = [
        {
          key: "_Checkout_Switcher_Upgrade",
          type: "removeAttribute",
          value: "",
        },
      ];
    }

    await applyCartLinesChange(payload);

    await applyAttributeChange({
      key: "checkoutSwitcher",
      type: "updateAttribute",
      value: selectedSubs ? "upgrade" : "",
    });

    setAdding(false);
    
    if (selectedSubs == null) {
      setSubscription(false);
    }

    setTimeout(() => {
      if (selectedSubs) {
        setShowPopup(true);
      }
    }, 300);
  };

  const handlePress = useCallback(async () => {
    var product_change_id=target.current.merchandise.product.id.replace("gid://shopify/Product/","");
    var selectedVar=target.current.merchandise.id.replace("gid://shopify/ProductVariant/","");
    
    console.log("before variant", selectedVar)
    // if (product_change_id == "8110924923161" )
    // {
    //   switch(selectedVar)
    //   {
    //     case '47581438607641':
    //       selectedVar=45629483680025;
    //       break;
    //       case '47581438640409':
    //       selectedVar=45629483680025;
    //       break;
    //       case '47581438673177':
    //       selectedVar=45629483680025;
    //       break;
    //       case '47581438705945':
    //       selectedVar=45629483680025;
    //       break;
    //       case '40548003610905':
    //       selectedVar=45629483680025;
    //       break;
         
    //   }
    // }
    if (product_change_id == "7271989280856" || product_change_id =="7516289040472" || product_change_id=="7521912750168")
    {
      switch(selectedVar)
      {
        case '40769957888088':
          selectedVar=40630387671128;
          break;
          case '40099152920664':
          selectedVar=40099167535192;
          break;
          case '40099152887896':
          selectedVar=40099167502424;
          break;
          case '40099152855128':
          selectedVar=40099167469656;
          break;
          case '40099152822360':
          selectedVar=40099167436888;
          break;
          case '40099152789592':
          selectedVar=40099167404120;
          break;
          case '40099152756824':
          selectedVar=40099167371352;
          break;
          case '40874605740120':
          selectedVar=40099167371352;
          break;
          case '40874605772888':
          selectedVar=40099167404120;
          break;
          case '40874605805656':
          selectedVar=40099167436888;
          break;
          case '40874605838424':
          selectedVar=40099167469656;
          break;
          case '40874605871192':
          selectedVar=40099167502424;
          break;
          case '40874605903960':
          selectedVar=40099167535192;
          break;
          case '40874605936728':
          selectedVar=40630387671128;
          break;
          case '40893315940440':
          selectedVar=40099167371352;
          break;
          case '40893315973208':
          selectedVar=40099167404120;
          break;
          case '40893316005976':
          selectedVar=40099167436888;
          break;
          case '40893316038744':
          selectedVar=40099167469656;
          break;
          case '40893316071512':
          selectedVar=40099167502424;
          break;
          case '40893316104280':
          selectedVar=40099167535192;
          break;
          case '40893316137048':
          selectedVar=40630387671128;
          break;
      }
    }
    console.log("after variant", selectedVar)
    
    if (!subscription) {
      setLoading(true);
      const result = await applyCartLinesChange({
        type: "updateCartLine",
        id: target.current.id,
        merchandiseId: "gid://shopify/ProductVariant/"+selectedVar,
        quantity: target.current.quantity,
        attributes: [
          {
            key: "_Checkout_Switcher_Upgrade",
            value: "Subscription",
          },
        ],
        sellingPlanId:
          product.products.nodes[0].sellingPlanGroups.nodes[0].sellingPlans
            .nodes[0].id,
      });

      const results = await applyAttributeChange({
        key: "checkoutSwitcher",
        type: "updateAttribute",
        value: product.products.nodes[0].sellingPlanGroups.nodes[0].sellingPlans
          .nodes[0].id
          ? "upgrade"
          : "",
      });

      setSubscription(true);
      setLoading(false);
    }
    // setShowPopup(!showPopup);
    setHandleRemove(false);
  }, [product, subscription, showPopup, handleRemove]);

  const handleQty = useCallback(
    async (value) => {
      const result = await applyCartLinesChange({
        type: "updateCartLine",
        id: target.current.id,
        merchandiseId: target.current.merchandise.id,
        quantity: value,
      });
      setSelectedQty(value);
    },
    [selectedQty]
  );

  const handleSubsChange = useCallback(
    (value) => {
     
      setSelectedSubs(value);
      if (value == "One time purchase") {
        value = null;
      }
      handleAddToCart(selectedQty, value, selectedVar);
    },
    [selectedSubs, selectedQty, selectedSubs, selectedVar]
  );

  const handleclose = useCallback(() => {
    if (!subscription) {
      setShowPopup(false);
    } else {
      if (subscription) {
        setShowPopup(true);
      }
    }
  }, [showPopup]);

  const getProduct = (id) => {
    let gid = id.replace(/\D/g, "");
    query(
      `query ($first: Int! , $id: String!) {
        products(first: $first query: $id) {
          nodes {
            id
            title
            tags
            requiresSellingPlan
            sellingPlanGroups(first: 5) {
              nodes {
                sellingPlans(first: 250) {
                  nodes {
                    id
                    name
                    options {
                      name
                      value
                    }
                    description
                  }
                }
                
                name
                options {
                  name
                  values
                }
              }
            }
            images(first:1){
              nodes {
                url
              }
            }
            variants(first: 50) {
              nodes {
                id
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
        variables: { first: 1, id: "id:" + gid },
      }
    )
      .then(({ data }) => {
        console.log('DATAAA', data)
        setProduct(data);

        let parseVar = data.products.nodes[0].variants.nodes;
        let varDataTemp = [];
        if (parseVar.length > 1) {
          //setShowVar(true);
          for (let varop of parseVar) {
            if (varop.selectedOptions[0].name == "Quantity") {
              varDataTemp.push({
                value: varop.id,
                label: varop.selectedOptions[0].value,
              });
            }
          }
        }

        const containsHideCheckoutSwitcher =
          data.products.nodes[0].tags.includes("hide-checkout-switcher");

        if (varDataTemp.length > 0) {
          setVarData(varDataTemp);
          setSelectedVar(varDataTemp[0].value);
        }

        let parseSubs = data.products.nodes[0].sellingPlanGroups.nodes;
        let subsDataTemp = [];

        if (parseSubs.length > 0) {
          let parsePlans;
          if(parseSubs.length > 1){
             parsePlans = parseSubs;

          }else{
             parsePlans = parseSubs[0].sellingPlans.nodes;
          }

          setShowOption(true);

          subsDataTemp.push({ value: 'One time purchase', label: "One time purchase" });
          for (let subs of parsePlans) { 
            if(parseSubs.length > 1){
            subsDataTemp.push({ value: subs.sellingPlans.nodes[0].id, label: subs.sellingPlans.nodes[0].name});
            }else{
            subsDataTemp.push({ value: subs.id, label: subs.name });
            }
          }
        }
        console.log(subsDataTemp);

        if (subsDataTemp.length > 0) {
          setSubsData(subsDataTemp);
          setSelectedSubs(subsDataTemp[0].value);
        }

        if (containsHideCheckoutSwitcher) {
          setAppSub(false);
        }
      })
      .catch((error) => {
        // console.error(error)
      })
      .finally(() => setLoading(false));
  };
console.log("target",target)
  useEffect(() => {
    if (!product) {
    //   if(target.current.merchandise.product.id=='gid://shopify/Product/8110924923161')
    //   {
    //     getProduct('gid://shopify/Product/8437251932441');
    //     console.log("Product match")
    //   }
    //   else{
    //   getProduct(target.current.merchandise.product.id);}
    // }
    if(target.current.merchandise.product.id=='gid://shopify/Product/7271989280856' || target.current.merchandise.product.id =="gid://shopify/Product/7516289040472" || target.current.merchandise.product.id=="gid://shopify/Product/7521912750168")
      {
        getProduct('gid://shopify/Product/7271995867224');
        console.log("Product match")
      }
      else{
      getProduct(target.current.merchandise.product.id);}
    }

    const filteredAttributes = target.current.attributes.filter(
      (obj) => obj.key === "_Checkout_Switcher_Upgrade"
    );

    if (
      (filteredAttributes.length > 0 &&
        filteredAttributes[0].value === "Subscription") ||
      target.current.merchandise.sellingPlan
    )  {
      setShowPopup(true);
      setSubscription(true);
      setAppSub(true);
      if (target.current.merchandise.sellingPlan) {
        setSelectedSubs(target.current.merchandise.sellingPlan.id);
      }
    } else {
      if (!target.current.merchandise.sellingPlan) {
        setAppSub(true);
        setHandleRemove(false);
      } else {
        if (target.current.merchandise.sellingPlan && modify_button) {
          setShowPopup(true);
          setSubscription(true);
          setAppSub(true);
          if (target.current.merchandise.sellingPlan) {
            setSelectedSubs(target.current.merchandise.sellingPlan.id);
          }
        }
      }
    }
    
    setSelectedQty(target.current.quantity);
  }, [product, subsData, subscription, handleRemove, selectedQty]);

  useEffect(() => {
    if (cartitems.length == 0) {
      location.href = location.origin;
    }
  }, [cartitems]);
  
    return (
      (target.current.merchandise.product.id=="gid://shopify/Product/7271989280856"  || target.current.merchandise.product.id =="gid://shopify/Product/7516289040472" || target.current.merchandise.product.id=="gid://shopify/Product/7521912750168") ? (
      <Grid
        columns={[300]}
        rows={[25]}
        spacing="none"
        padding="none"
        accessibilityRole="main"
        accessibilityLabel="Switch to subscription"
      >
        
          <View padding="none" spacing="none">
            <Pressable
              display="inline"
              kind="plain"
              accessibilityRole="button"
              inlineAlignment="center"
              loading={loading}
              onPress={(event) => handlePress(event)}
             
            >
               
             
                <InlineStack
                  blockAlignment="center"
                  inlineAlignment="center"
                  spacing="extraTight"
                >
                  
                    <TextBlock emphasis="bold" size="small" appearance="accent">
                      {subscription_text
                        ? subscription_text
                        : "Upgrade to Subscription & Save"}
                    </TextBlock>
                   
                </InlineStack>
              
            </Pressable>
          </View>
        
      </Grid>
      ):(
      <Grid
      columns={[300]}
      rows={[25]}
      spacing="none"
      padding="none"
      accessibilityRole="main"
      accessibilityLabel="Switch to subscription"
    >
      {showOption && (
        <View padding="none" spacing="none">
          <Pressable
            display="inline"
            kind="plain"
            accessibilityRole="button"
            inlineAlignment="center"
            loading={loading}
            onPress={(event) => handlePress(event)}
            overlay={
              (subscription && showPopup) && (
                <Popover
                  position="blockEnd"
                  alignment="start"
                  id="popover"
                  onClose={() => handleclose()}
                >
                  <View padding="base">
                    {handleRemove ? (
                      <Spinner />
                    ) : (
                      <BlockStack>
                        <Grid
                          columns={[300]}
                          rows={"auto"}
                          spacing={
                            (remove_button && quantity_selector) ||
                            (!remove_button && quantity_selector)
                              ? "loose"
                              : "none"
                          }
                        >
                          {subsData && (
                            <Select
                              label="Subscribe and save"
                              value={selectedSubs}
                              options={subsData}
                              onChange={(value) => handleSubsChange(value)}
                            />
                          )}
                          {(remove_button || quantity_selector) && (
                            <InlineLayout
                              spacing="none"
                              columns={[
                                (remove_button && quantity_selector) ||
                                (!remove_button && quantity_selector)
                                  ? "70%"
                                  : "20%",
                                "fill",
                              ]}
                            >
                              {quantity_selector && (
                                <Stepper
                                  label="Quantity"
                                  onInput={handleQty}
                                  onChange={handleQty}
                                  value={selectedQty}
                                />
                              )}
                              {remove_button && (
                                <Button
                                  appearance="critical"
                                  kind="plain"
                                  loading={adding}
                                  onPress={() => handleAddToCartRemove()}
                                >
                                  Remove
                                </Button>
                              )}
                            </InlineLayout>
                          )}
                        </Grid>
                      </BlockStack>
                    )}
                  </View>
                </Popover>
              )
            }
          >
            {appSub && (
              <InlineStack
                blockAlignment="center"
                inlineAlignment="center"
                spacing="extraTight"
              >
                {!subscription ? (
                  <TextBlock emphasis="bold" size="small" appearance="accent">
                    {subscription_text
                      ? subscription_text
                      : "Upgrade to Subscription & Save"}
                  </TextBlock>
                ) : (
                  <InlineStack
                    blockAlignment="center"
                    inlineAlignment="center"
                    spacing="extraTight"
                  >
                    <TextBlock
                      appearance="accent"
                      size="small"
                      inlineAlignment="center"
                    >
                      <Text size="small">
                        {subscription_link_text
                          ? subscription_link_text
                          : "Adjust"}
                      </Text>
                    </TextBlock>
                    <Icon
                      appearance="accent"
                      size="extraSmall"
                      source="chevronDown"
                    />
                  </InlineStack>
                )}
              </InlineStack>
            )}
          </Pressable>
        </View>
      )}
    </Grid>
    )
    );
}
 