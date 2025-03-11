import {
  TextContainer,
  LegacyCard,
  AlphaCard,
  CalloutCard,
  Page,
  Layout,
  Text,
  MediaCard,
  VideoThumbnail,
  LegacyStack,
  Button,
  DataTable,
  Link,
  Modal,
  Icon,
  HorizontalStack,
  Bleed,
} from "@shopify/polaris";
import { TitleBar, useNavigate } from "@shopify/app-bridge-react";

import { DeleteMajor } from "@shopify/polaris-icons";
// import {useNavigate} from '@shopify/app-bridge-react';

import { trophyImage } from "../assets";

import { AddIconModal } from "../components";

import { useEffect, useState } from "react";
import YouTube from "react-youtube";
import { useAuthenticatedFetch } from "../hooks";

export default function HomePage() {
  const navigate = useNavigate();
  const fetch = useAuthenticatedFetch();
  const [revenueUpsell, setRevenueUpsell] = useState(0);
  const [upsellsCount, setUpsellsCount] = useState(0);

  const [revenueSubscription, setRevenueSubscription] = useState(0);
  const [subscriptionsCount, setSubscriptionsCount] = useState(0);

  const [isOpen, setIsOpen] = useState(false);
  const [iconData, setIconData] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    getIcons();
  };

  const opts = {
    height: "320",
    width: "580",
  };

  const handleToggleModal = () => {
    setIsOpen(!isOpen);
  };

  const [icons, setIcons] = useState([]);

  const handleAddIcon = (newIcon) => {
    setIcons((prevIcons) => [...prevIcons, newIcon]);
  };

  const getIcons = async () => {
    // Send the FormData to the server
    const response = await fetch("/api/icons");

    if (response.ok) {
      const responseData = await response.json();
      console.log(responseData);
      let tmpData = [];

      responseData.forEach((element) => {
        tmpData.push({
          id:element.id,
          title: element.title,
          img: element.iconUrl,
        });
      });

      setIconData(tmpData);
    }
  };

  useEffect(async () => {
    
    getIcons();
    const analytics = await fetch("/api/analytics/count");
    // console.log(analytics);
    var data = await analytics.json();
    console.log('DATA', data);
    // setRevenue(data.totalRevenue);
    // setUpgrades(data.totalProductsUpgraded);
    setRevenueSubscription(data.subscriptionRevenue)
    setRevenueUpsell(data.upsellRevenue)

    setSubscriptionsCount(data.totalSubscriptionProducts)
    setUpsellsCount(data.totalUpsellProducts)
  }, []);

  const videoId = "go1tMLFjj0g"; // Replace with your YouTube video ID

  const columns = ["Title", "Icon", "Action"];

  const handleDel = async (icon) => {
    // console.log(icon)
    const response = await fetch(`/api/icons/${icon.id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      const responseData = await response.json();
      getIcons()
      console.log(responseData)
    }
  }

  const rows = iconData.map((icon, index) => [
    <Text>{icon.title}</Text>,
    <img src={icon.img} alt={icon.title} width="30" height="30" />,
    <Button plain onClick={ () => handleDel(icon)}><Icon source={DeleteMajor} color="base" /></Button>,
  ]);

  return (
    <Page narrowWidth>
      <Layout>
        <Layout.Section>
          <div style={{marginBottom:"5px"}}>
          <LegacyStack
            wrap={false}
            distribution="fillEvenly"
            alignment="baseline"
            spacing="baseTight"
          >
            <div style={{ textAlign: "center" }}>
              <LegacyCard title="Revenue from Upsells" sectioned>
                <p style={{ fontSize: "30px", fontWeight: "500" }}>
                  ${revenueUpsell}
                </p>
              </LegacyCard>
            </div>
            <div style={{ textAlign: "center" }}>
              <LegacyCard title="Upsells" sectioned>
                <p style={{ fontSize: "30px", fontWeight: "500" }}>
                  {upsellsCount}
                </p>
              </LegacyCard>
            </div>
          </LegacyStack>
          </div>
          <LegacyStack
            wrap={false}
            distribution="fillEvenly"
            alignment="baseline"
            spacing="baseTight"
          >
            <div style={{ textAlign: "center" }}>
              <LegacyCard title="Revenue from Subscription" sectioned>
                <p style={{ fontSize: "30px", fontWeight: "500" }}>
                  ${revenueSubscription}
                </p>
              </LegacyCard>
            </div>
            <div style={{ textAlign: "center" }}>
              <LegacyCard title="Subscriptions" sectioned>
                <p style={{ fontSize: "30px", fontWeight: "500" }}>
                  {subscriptionsCount}
                </p>
              </LegacyCard>
            </div>
          </LegacyStack>
        </Layout.Section>
        <Layout.Section>
       
          <AlphaCard sectioned>
          <Text marginBlockEnd="8" Text variant="headingMd" as="h2" fontWeight="medium">
           Checkout Switcher Icons 
              </Text>

              <p style={{ padding: "10px 0px" }}>
              Add icons and text below. You will be able to display them in either horizontal or vertical position in the checkout customizer, customize&nbsp;<Link url="https://www.notion.so/checkout-switcher/Checkout-Switcher-Helpcenter-a3bb41f84307429f8a5b3f3988c65234">it here.</Link> 
              </p>
           
            <Modal
              open={isModalOpen}
              onClose={toggleModal}
              title="Add Icon"
              // primaryAction={{
              //   content: "Add Icon",
              //   onAction: () => {
              //     toggleModal();
              //     onAddIcon();
              //   },
              // }}
              secondaryActions={[
                {
                  content: "Cancel",
                  onAction: toggleModal,
                },
              ]}
            >
              <AddIconModal onAddIcon={handleAddIcon} onClose={toggleModal} />
            </Modal>
            
            <DataTable
              columnContentTypes={["text", "text"]}
              headings={columns}
              rows={rows}
            />
            <Link to="/add-icon">
              <Button primary onClick={toggleModal}>
                Add Icon
              </Button>
            </Link>
          </AlphaCard>
        </Layout.Section>
        <Layout.Section>
          <CalloutCard
            title="Manage your Checkout Switcher extensions"
            illustration="https://cdn.shopify.com/s/assets/admin/checkout/settings-customizecart-705f57c725ac05be5a34ec20c05b94298cb8afd10aac7bd9c7ad02030f48cfa0.svg"
            primaryAction={{
              content: "Customize your checkout",
              onAction: () => {
                console.log("clikced"); 
                navigate(`https://admin.shopify.com/settings/checkout/editor`);
              },
            }}
          >
         <p>
            Use the button below to customize and adjust the settings of
Checkout Switcher extensions.
            </p>
            <p>
            You can add reviews/text block, upsell products (you will need to tag your products with tag "checkout-upsell", 
              more detailed explanation here) and manage your One Click upsell and your unique selling point icons.
            </p>
          </CalloutCard>
        </Layout.Section>
        <Layout.Section>
          <MediaCard
            title="Customize your checkout"
            primaryAction={{
              content: "Learn more",
              url: "https://www.notion.so/checkout-switcher/Checkout-Switcher-Helpcenter-a3bb41f84307429f8a5b3f3988c65234",
              external: true,
              target: "_blank",
            }}
            description={`Learn all about  Checkout Switcher with our quick start guide.`}
            popoverActions={[{ content: "Dismiss", onAction: () => {} }]}
          >
            <VideoThumbnail
              videoLength={98}
              thumbnailUrl="https://cdn.shopify.com/s/files/1/0719/4050/5881/files/poster-video.jpg?v=1688567388"
              onClick={handleToggleModal}
            />
          </MediaCard>
        </Layout.Section>
        <Layout.Section>
          <AlphaCard sectioned>
            <TextContainer spacing="tight" padding="10">
              <Text
                variant="headingLg"
                as="h5"
                alignment="center"
                fontWeight="semibold"
              >
                Complimentary Checkout Switcher setup
              </Text>
              <Text alignment="center">
                We will help you setup Checkout Switcher and uncover any <br />
                opportunities for your store. <br /> <br />
                <Button
                  url="https://checkout-switcher.notion.site/Schedule-a-call-0132ac5c95734835a519e8290ae943b8"
                  external={true}
                  childAlign="center"
                  primary
                >
                  Schedule a Call
                </Button>
              </Text>
            </TextContainer>
          </AlphaCard>
        </Layout.Section>

        <Layout.Section>
          <AlphaCard sectioned>
            <TextContainer spacing="tight" padding="10">
              <Text variant="headingSm" as="h4" fontWeight="bold">
                Support
              </Text>
              <Text>
                For any question, concern, or assistance, email us and we'll get
                back to you as soon as possible (usually with in 24 hours).
              </Text>
              <hr></hr>
              <div style={{ color: "blue" }}>
                <Text color="info">
                  <Link
                    target="_blank"
                    url="mailto:support@checkoutswitcher.com"
                  >
                    support@checkoutswitcher.com
                  </Link>{" "}
                </Text>
              </div>
            </TextContainer>
          </AlphaCard>
        </Layout.Section>

</Layout>
      <div>
        <Modal
          open={isOpen}
          sectioned
          noScroll={true}
          fullScreen={true}
          onClose={handleToggleModal}
          title="Getting started with  Checkout Switcher One-Click"
          // primaryAction={{
          //   content: "Close",
          //   onAction: handleToggleModal,
          // }}
        >
          <Modal.Section>
            <YouTube opts={opts} videoId={videoId} />
          </Modal.Section>
        </Modal>
      </div>
    </Page>
  );
}
