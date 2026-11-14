/* Copyright 2026 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { colorize } from "../external/color_utils.mjs";

const TEST_PASSED = colorize("green", "TEST-PASS");
const TEST_UNEXPECTED_FAIL = colorize(["red", "bold"], "TEST-UNEXPECTED-FAIL");

function colorBrowser(name) {
  return colorize("cyan", name);
}

export { colorBrowser, TEST_PASSED, TEST_UNEXPECTED_FAIL };
