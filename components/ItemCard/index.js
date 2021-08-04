import React, { useRef, useState, useEffect } from 'react';
import {
    Flex,
    Image,
    Text,
    Spinner
} from '@chakra-ui/react';
import { ethers } from "ethers";
import { useRouter } from 'next/router';
import { useWallet } from 'use-wallet';
import { getAuction, getHighestBid } from '../../contracts/auction';
import { getMetadata, getSateInfo } from '../../contracts/sate';
import { SATE_AUCTION_ADDRESS, SATE_NFT_ADDRESS } from '../../utils/const';
import { formatNumber } from "../../lib/helper";

const ItemCard = ({id, starlPrice}) => {

    const router = useRouter();
    const wallet = useWallet();
    const [tokenInfo, setTokenInfo] = useState({});
    const [price, setPrice] = useState("0");
    const [resulted, setResulted] = useState(true);

    useEffect(async () => {
        loadData();
        setInterval(async () => {
            await loadData();
        }, 15000);
    }, []);

    const loadAuctionInfo = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        if (provider) {
            const network = await provider.getNetwork();
            const bidInfo = await getHighestBid(SATE_AUCTION_ADDRESS[network.chainId], id, provider);
            const auctionInfo = await getAuction(SATE_AUCTION_ADDRESS[network.chainId], id, provider);
            const highestBidPrice = bidInfo.bid.toString();
            if (parseFloat(highestBidPrice) > parseFloat(price)) {
                setPrice(highestBidPrice);
            }

            console.log(auctionInfo);
        }
    }

    const loadData = async () => {
        //if (wallet && wallet.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const network = await provider.getNetwork();
            const metadata = await getMetadata(SATE_NFT_ADDRESS[network.chainId], id, provider);
            const auctionInfo = await getAuction(SATE_AUCTION_ADDRESS[network.chainId], id, provider);
            const bidInfo = await getHighestBid(SATE_AUCTION_ADDRESS[network.chainId], id, provider);
            
            if (auctionInfo.resulted) {
                const sateInfo = await getSateInfo(SATE_NFT_ADDRESS[network.chainId], id, provider);
                console.log(sateInfo);
                setPrice(sateInfo.st_launchPrice.toString());
            } else {
                setPrice(auctionInfo.reservePrice > bidInfo.bid ? auctionInfo.reservePrice.toString() : bidInfo.bid.toString());
            }
            setResulted(auctionInfo.resulted);

            if (!metadata) return;
            fetch(metadata)
            .then((response) => response.text())
            .then((infoResponse) => {
                try {
                    const jsonInfo = JSON.parse(infoResponse);

                    if (!jsonInfo || !jsonInfo.image || !jsonInfo.name || !jsonInfo.animation_url) {
                        throw new Error('Invalid json info');
                    }
                    setTokenInfo(jsonInfo);
                } catch (e) {
                    console.error('[INFO] Invalid tokenUri', metadata);
                }
            });
        //  }
    }

    const handleClick = e => {
        e.preventDefault();
        const path = resulted ? `https://opensea.io/assets/0x48470fb3fe7108b9e15b2bf7aa15b7adf774d721/${id}` : `/buyitem?id=${id}`;
        router.push(path);
    }

    if (!tokenInfo.name) {
        return (
            <Flex as="button" textAlign="left" border="none" w="100%" h="100%" p="2px" borderRadius="7px" bg="transparent" _hover={{ background: "linear-gradient(225deg, #FDBF25, #B417EB, #0D57FF, #2D9CB4)" }} _focusWithin={{ background: "linear-gradient(225deg, #FDBF25, #B417EB, #0D57FF, #2D9CB4)" }} >
                <Flex flexDirection="column" w="100%" h="350px" bg="#0e1429" 
                    lineHeight="30px" borderRadius="6px" p="1rem" cursor="pointer"
                >
                    <Spinner size="xl" thickness="4px" color="blue.500" emptyColor="gray.600" m="auto" />
                </Flex>
            </Flex>
        )
    }

    const _price = ethers.utils.formatUnits(price, "ether");
    return (
        <Flex as="button" textAlign="left" border="none" onClick={handleClick} w="100%" h="100%" p="2px" borderRadius="7px" bg="transparent" _hover={{ background: "linear-gradient(225deg, #FDBF25, #B417EB, #0D57FF, #2D9CB4)" }} _focusWithin={{ background: "linear-gradient(225deg, #FDBF25, #B417EB, #0D57FF, #2D9CB4)" }} >
            <Flex flexDirection="column" w="100%" h="100%" bg="#0e1429" 
                lineHeight="30px" borderRadius="6px" p="1rem" cursor="pointer"
            >
                <Flex mb="1rem" position="relative">
                    <Image src={`item/${tokenInfo.attributes[5].value}.png`} w="26px" h="36px" position="absolute" top="0.5rem" left="0.5rem" zIndex="100" alt="item type"></Image>
                    <Flex w="100%" h="100%" justifyContent="center">
                        <Flex w="100%">
                            <Image src={tokenInfo.image} w="100%" borderRadius="10px" opacity="0.7" />
                        </Flex>
                    </Flex>
                </Flex>
                <Text textColor="#fff" fontWeight="500" fontSize={["20px", "16px", "16px", "16px", "20px"]}>{tokenInfo.name}</Text>
                <Text textColor="rgba(255, 255, 255, 0.4)" fontSize={["15px", "12px", "12px", "12px", "15px"]}>{tokenInfo.attributes[5].value} Satellite</Text>
                <Flex alignItems="center">
                    <Image src="item/coin_logo.png" w={["20px", "16px", "16px", "16px", "20px"]} alt="coin logo"></Image>
                    <Text textColor="#FDB32A" fontSize={["15px", "12px", "12px", "12px", "15px"]} fontWeight="500" ml="0.5rem">{formatNumber(parseFloat(_price), 1)} STARL</Text>
                </Flex>
                <Flex alignItems="center">
                    <Text textColor="#FDB32A" fontSize={["15px", "12px", "12px", "12px", "15px"]} fontWeight="500" ml={["24px", "28px"]}>{formatNumber(parseFloat(_price) * starlPrice, 1)} USD</Text>
                </Flex>
            </Flex>
        </Flex>
    );
};

export default ItemCard;