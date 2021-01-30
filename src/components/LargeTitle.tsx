import {ReactNode} from 'react';

export function LargeTitle({children}: {children: ReactNode}) {
  return <h1>{children}</h1>;
}

// export const LargeTitle = styled.h1`
//   font-size: 450%;
//   letter-spacing: 3px;
//   color: black;
//   text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff;
//
//   @supports (-webkit-text-stroke: 1px white) {
//     color: transparent;
//     text-shadow: none;
//     text-stroke: 2px white;
//     -webkit-text-stroke: 2px white;
//   }
// `;
