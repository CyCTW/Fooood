import {
  Flex,
  IconButton,
  Input,
  Text,
  Menu,
  MenuButton,
  MenuList,
  Stack,
  Box,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import { useHistory, useRouteMatch } from "react-router-dom";
import "../style.css";

const SearchBox = ({ setMapResponse, mapAPILoaded, mapInstance, mapAPI }) => {

  const [inputText, setInputText] = useState();
  const [autocompleteSearch, setAutocompleteSearch] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  const history = useHistory();
  let { url } = useRouteMatch();

  // Googlemap autocomplete search
  const handleAutoComplete = () => {
    if (mapAPILoaded && inputText) {
      const service = new mapAPI.places.AutocompleteService();
      //   const service = new mapAPI.places.PlacesService(mapInstance);
      const request = {
        input: inputText,
      };

      service.getPlacePredictions(request, (results, status) => {
        if (status === mapAPI.places.PlacesServiceStatus.OK) {
          setAutocompleteSearch(results);
        }
      });
    }
  };

  // call autocomplete when user input change
  useEffect(() => {
    handleAutoComplete();
    if (inputText) {
      setMenuOpen(true);
    }
  }, [inputText]);

  // handle user input
  const handleInputOnChange = (e) => {
    setInputText(e.target.value);
  };

  // handle user click autocomplete search result
  const handleClickItem = async (e) => {
    setInputText(e.target.innerHTML);
    setMenuOpen(false);

    const placeId = e.target.getAttribute("dataid");

    const service = new mapAPI.places.PlacesService(mapInstance);
    const request = {
      placeId,
      fields: [
        "name",
        "rating", // 評價
        "formatted_address", // 地址
        "formatted_phone_number", // 電話
        "geometry", // 幾何資訊
        "opening_hours", // 營業時間資訊
        "photos",
        "utc_offset_minutes",
      ],
    };
    await service.getDetails(request, (results, status) => {
      if (status === mapAPI.places.PlacesServiceStatus.OK) {
        // deal with null value
        setMapResponse({
          photos: results.photos ? results.photos : null,
          name: results.name && results.name,
          rating: results.rating && results.rating,
          formatted_address:
            results.formatted_address && results.formatted_address,
          weekday: results.opening_hours && results.opening_hours.weekday_text,
          isOpen: results.opening_hours && results.opening_hours.isOpen(),
          geometry: results.geometry && results.geometry,
        });

        history.push(`${url}/add/${placeId}`);
      }
    });
  };

  const handleFocus = () => {
    setMenuOpen(true);
  };
  const handleBlur = () => {
    setMenuOpen(false);
  };
  return (
    <Flex
      w="300px"
      m={2}
      style={{ position: "fixed", top: "5px", zIndex: "2" }}
    >
      <Menu isOpen={menuOpen}>
        {/* <Input value={inputText && inputText} /> */}
        <MenuButton
          as={IconButton}
          icon={<SearchIcon />}
          mr={2}
          bgColor="black"
          color="white"
        />

        <Input
          //   border="2px"
          isInvalid
          errorBorderColor="black"
          focusBorderColor="black"
          // variant="outline"
          placeholder="Search restaurant/place"
          //   onChange={debounce(handleInputOnChange, 500)}
          onChange={handleInputOnChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={inputText && inputText}
          w="300px"
          style={{ color: "black" }}
        />

        <MenuList>
          {autocompleteSearch && inputText ? (
            autocompleteSearch.map((res, idx) => {
              return (
                <Stack key={idx} w="300px" m={5}>
                  <Text
                    dataid={res.place_id}
                    fontSize="xl"
                    align="left"
                    onMouseDown={handleClickItem}
                    as="button"
                  >
                    {res.structured_formatting.main_text}
                  </Text>
                  <Text fontSize="12px">
                    {res.structured_formatting.secondary_text}
                  </Text>
                </Stack>
              );
            })
          ) : (
            <Box w="300px" m={5}>
              <Text style={{ color: "gray" }}>No results</Text>
            </Box>
          )}
        </MenuList>
      </Menu>
    </Flex>
  );
};
export default SearchBox;
