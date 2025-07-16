
import { css } from "styled-components";
import { devices } from "./devices";

export const media = Object.keys(devices).reduce((acc, label) => {
    acc[label] = (...args) => `
      @media only screen and (max-width: ${devices[label]}px) {
        ${css(...args)};
      }
    `;
    return acc;
}, {})
