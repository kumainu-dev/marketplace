import React, { useState, useEffect } from 'react';
import  {
    Flex,
    Text,
    FormLabel,
    SimpleGrid,
} from '@chakra-ui/react';
import ItemCard from '../ItemCard';
import SortBy from '../SortbyComponent';
import CustomSwitch from '../CustomSwitch';
import { getStarlPrice } from '../../lib/helper';

const tokenIds = [16, 17, 18, 11, 12, 13, 14, 15, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const ItemList = () => {

    const [price, setPrice] = useState(0);

    useEffect(async () => {
        const starlPrice = await getStarlPrice();
        setPrice(starlPrice);
    }, []);

    return (
        <Flex flexDirection="column" w="100%" h="100%" ml={["5rem", "5rem", "2rem", "3rem", "4rem"]} mr={["1rem", "1rem", "2rem", "1rem", "auto"]}>
            <Flex flexDirection="column">
                <FormLabel textColor="#fff" fontSize={["15px", "20px", "18px", "24px", "32px"]} fontWeight="400" fontFamily="ArcadeClassic" mt="1.5rem" mb="1.5rem">WELCOME TO THE SATE MARKETPLACE</FormLabel>
                <FormLabel fontSize={["10px", "15px", "10px", "16px", "16px"]} fontWeight="400" textColor="rgba(255, 255, 255, 0.4)">Here you can search and buy SATE with STARL to incorporate them into your metaverse</FormLabel>
            </Flex>
            <Flex flexDirection="column" display={["flex", "flex", "none"]}>
                <Flex justifyContent="space-between" alignItems="center" mt="10px">
                    <FormLabel textColor="#fff" fontSize="16px" fontWeight="400">On sale</FormLabel>
                    <CustomSwitch />
                </Flex>
            </Flex>
            <Flex w="100%" mt="1.5rem" flexDirection={["column", "column", "row", "row", "row"]} justifyContent="space-between">
                <Flex alignItems="center">
                    <Text fontWeight="400" textColor="#fff" fontSize={["15px", "20px", "15px", "24px", "24px"]} fontFamily="ArcadeClassic">NFTS FOR SALE</Text>
                    <Flex w="105px" h="40px" bg="#1d253f" ml="1.5rem" borderRadius="4px" alignItems="center">
                        <Text w="100%" textAlign="center" fontSize="12px" textColor="rgba(255, 255, 255, 0.26)">{tokenIds.length} results</Text>
                    </Flex>
                </Flex>
                <Flex textColor="#bcc0c1" fontSize="14px" alignItems="center" justifyContent={["none", "none", "flex-end"]} mt={["1rem", "1rem", "0"]}>
                    <Text>Sort by</Text>
                    <Flex h="40px" ml="1rem">
                        <SortBy />
                    </Flex>
                </Flex>
            </Flex>
            <SimpleGrid columns={["1", "2", "2", "3", "4"]} spacing={5} m="20px 0 30px 0">
                {tokenIds.map(id => <ItemCard id={id} key={id} starlPrice={price} />)}
            </SimpleGrid>
        </Flex>
    ); 
}

export default ItemList;