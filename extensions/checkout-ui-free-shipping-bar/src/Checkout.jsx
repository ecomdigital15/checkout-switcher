import React, { useEffect, useState } from 'react';
import {
  Banner,
  useApi,
  useTranslate,
  reactExtension,
  useCartLines,
  View,
  Text,
  BlockStack,
  SkeletonText,
  useSettings,
  Heading,
  Progress,
} from '@shopify/ui-extensions-react/checkout';

const FREE_SHIPPING_THRESHOLD = 1500;

export default reactExtension(
  'purchase.checkout.block.render',
  () => <Extension />,
);

function Extension() {
  const translate = useTranslate();
  const { extension } = useApi();
  const cartLines = useCartLines();
  const [cartTotal, setCartTotal] = useState(null); // Change the initial value to null to indicate loading
  const [loading, setLoading] = useState(true);
  const {free_shipping_goal} = useSettings();

  const freeShippingPrice = free_shipping_goal ? parseFloat(free_shipping_goal) : FREE_SHIPPING_THRESHOLD;



  useEffect(() => {
    if (cartLines) {
      const total = cartLines.reduce((sum, line) => sum + line.cost.totalAmount.amount * line.quantity, 0);
      setCartTotal(total);
      setLoading(false); // Data loaded
    }
  }, [cartLines]);

  const remainingAmount = freeShippingPrice - cartTotal;
  const progress = cartTotal !== null ? Math.min((cartTotal / freeShippingPrice) * 100, 100) / 100 : 0;

  if (loading) {
    return (
      <BlockStack spacing="loose">
        <View padding="base" border="base" borderRadius="loose" borderWidth="base" borderColor="decorative-border">
          <SkeletonText inlineSize="100%" />
          <SkeletonText inlineSize="50%" />
        </View>
      </BlockStack>
    );
  }

  return (
    <BlockStack spacing="loose">
      <View padding="base" border="base" borderRadius="loose" borderWidth="base" borderColor="decorative-border">
        <View
          border="base"
          borderRadius="loose"
          borderWidth="base"
          borderColor="decorative-border"
          backgroundColor="surface-neutral"
          maxInlineSize="100%"
        >
          {cartTotal !== null ? (
            <Progress value={progress} />



          ) : (
            <SkeletonText inlineSize="100%" />
          )}
        </View>
        {cartTotal !== null ? (
          remainingAmount > 0 ? (
            <Text size="medium" emphasis="strong">
              Add ${remainingAmount.toFixed(2)} for free shipping! (${freeShippingPrice.toFixed(2)}) 
            </Text>
          ) : (
            <Text size="medium" emphasis="strong">
              Congratulations! You qualify for free shipping!
            </Text>
          )
        ) : (
          <SkeletonText inlineSize="50%" />
        )}
      </View>
    </BlockStack>
  );
}
