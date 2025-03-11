import { GridItem } from "@shopify/ui-extensions-react/checkout";
import {
  BlockLayout,
  useApi,
  useTranslate,
  Image,
  View,
  Text,
  Grid,
  List,
  ListItem,
  InlineStack,
  reactExtension,
  useAppMetafields,
  useSettings,
  Divider,
  TextBlock,
  BlockStack,
} from "@shopify/ui-extensions-react/checkout";
import { useEffect } from "react";
import { useState } from "react";

export default reactExtension("purchase.checkout.block.render", () => (
  <Extension />
));

function Extension() {
  const translate = useTranslate();
  const { extension } = useApi();
  const [iconData, setIconData] = useState([]);

  const { style, component_alignment, text_alignment, icon_size } = useSettings();
  let componentAlignment = '';
  let textAlignment = '';
  let iconSize = '20%';
  let horizontalIconSize = '40%';

  if (text_alignment == "Left") {
    textAlignment = "start";
  } else if (text_alignment == "Center") {
    textAlignment = "center";
  } else {
    textAlignment = "end";
  }

  if (component_alignment == "Start") {
    componentAlignment = "start";
  } else if (component_alignment == "Center") {
    componentAlignment = "center";
  } else {
    componentAlignment = "end";
  }

  if(icon_size == "Small"){
    iconSize = '10%';
    horizontalIconSize = '40%';
  }else if(icon_size == "Medium"){
    iconSize = '15%';
    horizontalIconSize = '50%';
  }else {
    iconSize = '20%';
    horizontalIconSize = '60%';
  }

  const uspi = useAppMetafields({
    namespace: "checkout",
    key: "uspi",
    type: "shop",
  });

  const appUrl = useAppMetafields({
    namespace: "checkout",
    key: "appUrl",
    type: "shop",
  });

  useEffect(() => {
    if (uspi.length > 0) {
      const uspiData = JSON.parse(uspi[0]["metafield"]["value"]);
      const appUrlData = appUrl[0]["metafield"]["value"];
      if (iconData.length == 0) {
        let tmpData = [];

        uspiData.forEach((element) => {
          tmpData.push({
            title: element.title,
            img: element.iconUrl,
          });
        });

        setIconData(tmpData);
      }
    }
  }, [uspi]);

  return (
    <>
      {style == "Vertical" ? (
        <BlockLayout
          rows="auto"
          border={["none", "none", "none", "none"]}
          padding={["base", "none", "base", "base"]}
        >
          <View>
            {iconData &&
              iconData.map((item, index) => {
                return (
                  <BlockStack inlineAlignment={textAlignment}  key={index}>
                    <Grid
                      columns={[iconSize, "auto"]}
                      padding={["small200", "none", "base", "none"]}
                      blockAlignment={componentAlignment}
                      minInlineSize="100%"
                      inlineAlignment={textAlignment}
                      id="upper"
                    >
                      
                      <GridItem border="none" padding="none" minInlineSize="100%">
                        <Image source={item.img} aspectRatio={1}/>
                      </GridItem>
                      <GridItem border="none" padding={["none", "none", "none", "base"]} minInlineSize={180}>
                        <Text size="small" emphasis="bold" >
                          {item.title}
                        </Text>
                      </GridItem>
                     
                    </Grid>
                  </BlockStack>
                );
              })}
          </View>
        </BlockLayout>
      ) : (
        <Grid columns={["50%", "50%", "50%"]} rows={["auto"]} spacing="loose">
          {iconData &&
            iconData.map((item, index) => {
              return (
                <BlockLayout
                  key={index}
                  rows="auto"
                
                  border={["none", "none", "none", "none"]}
                  padding={["base", "none", "base", "none"]}
                  inlineAlignment={componentAlignment}
                  blockAlignment={componentAlignment}
                  minInlineSize="fill"
                  maxInlineSize="fill"
                  id="lower-horzantal"
                >
                  <View border="none" padding="none"  minInlineSize={horizontalIconSize} maxInlineSize={horizontalIconSize}>
                    <Image source={item.img} aspectRatio={1}/>
                  </View>
                  <View id="horText" border="none" padding={["base", "none", "none", "none"]} minInlineSize="fill" maxInlineSize="fill">
                    <TextBlock size="small" emphasis="bold" inlineAlignment={textAlignment}>
                      {item.title}
                    </TextBlock>
                  </View>
                </BlockLayout>
              );
            })}
        </Grid>
      )}
      <Divider spacing="loose"/>
    </>
  );
}
